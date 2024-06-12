import re
from transformers import pipeline

import Levenshtein
import requests
import jwt

import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import time
import datetime

fs = 44100 # sample rate, for audio quality

client = OpenAI()

# initialize Flask app
app = Flask(__name__)
CORS(app) # enables CORS for all routes

# ----------- User login/authentication endpoints ----------------------
app.config['SECRET_KEY'] = "lobsterfish"  # Change this to your own secret key

# Initialize the recipients list
recipients = []

# Dummy user database
users = {
    'brookeyangq': 'hostalkyai@123',
    'danielsongq': 'remitbeeai@123',
}

# Dummy user roles
user_roles = {
    'brookeyangq': 'hostalky',
    'danielsongq': 'remitbee',
}

# Dummy contact list
contacts = {
    'hostalky': [
        {'label': 'ross', 'value': '&ross'},
        {'label': 'pratheepan', 'value': '&pratheepan'}
    ],
    'remitbee': [
        {'label': 'neville', 'value': '&neville'},
        {'label': 'yogi', 'value': '&yogi'}
    ]
}

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'message': 'Username or Password is missing'}), 400

    username = data['username']
    password = data['password']

    if username in users and users[username] == password:
        token = jwt.encode({'username': username, 'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)}, app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'token': token})

    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/protected')
def protected():
    token = request.headers.get('Authorization')
    print(f"Token: {token}")
    if not token:
        return jsonify({'message': 'Token is missing'}), 401

    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        username = data['username']
        if username in user_roles:
            role = user_roles[username]
            user_contacts = contacts.get(role, [])
            recipients.clear()
            recipients.extend(user_contacts)
            return jsonify({'message': f'Welcome {username}!', 'contacts': user_contacts})
        else:
            return jsonify({'message': 'You do not have permission to access this route'}), 403

    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401


# ----------- Start of Security Measures for Prompt Injections -----------------------
# Set TOKENIZERS_PARALLELISM environment variable (for mitigating deadlock)
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Initialize a text classification pipeline using a pre-trained model
classifier = pipeline('text-classification', model="roberta-base")

# Define suspicious patterns or keywords commonly associated with prompt injections
SUSPICIOUS_PATTERNS = [
    re.compile(r'\bignore\b.*\bprevious\b.*\binstructions\b', re.IGNORECASE),
    re.compile(r'\bleak\b.*\binformation\b', re.IGNORECASE),
    re.compile(r'\bexecute\b.*\bcode\b', re.IGNORECASE),
    re.compile(r'\bdisregard\b.*\ball\b.*\brules\b', re.IGNORECASE),
    re.compile(r'\bforget\b.*\ball\b.*\binstructions\b', re.IGNORECASE),
    re.compile(r'\bshutdown\b.*\bsystem\b', re.IGNORECASE),
    re.compile(r'\bdisable\b.*\bsecurity\b', re.IGNORECASE),

    # custom added patterns
    re.compile(r'<?title_content>?', re.IGNORECASE),
    re.compile(r'<?summary_content>?', re.IGNORECASE),
]

def detect_prompt_injection(prompt):
    # Check for suspicious patterns
    for pattern in SUSPICIOUS_PATTERNS:
        if pattern.search(prompt):
            print(f"Pattern match detected: {pattern.pattern}")
            return True

    # Analyze prompt sentiment or intent using a text classification model
    analysis = classifier(prompt)
    for result in analysis:
        if result['label'] == 'NEGATIVE' and result['score'] > 0.9:
            return True

    return False



# ------------ Start of code --------------------------------

@app.route('/recipients', methods=['GET'])
def get_recipients():
    return jsonify(recipients)


# set date and time
@app.route('/timedate')
def get_time():
    date = datetime.datetime.now()
    return jsonify({ 'date':date })

# notes page
@app.route('/notes', methods=['POST'])
def get_note():
    # data validation
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
    
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request JSON is empty'}), 400
    
    title = data.get('title')
    summary = data.get('summary')

    if not title.strip() or not summary.strip():
        return jsonify({'title': 'Missing details', 'summary': 'Both title and summary are required'})
    
    
    # data processing
    response = rephrase(title, summary)
    response = json.loads(response)
    response = jsonify(response)
    
    return response

# reminder page
@app.route('/reminder', methods=['POST'])
def get_reminder():
    # data validation
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 401
    
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request JSON is empty'}), 402
    
    title = data.get('title')
    summary = data.get('summary')
    date_time = data.get('date_time')

    # testing date_time format
    print(date_time)

    if not title.strip() or not summary.strip() or not date_time:
        return jsonify({'title': 'Missing details', 'summary': 'All three title, summary, and date_time are required'})
    
    # data processing
    response = set_reminder(title, summary, date_time)

    return response

# announce page
@app.route('/announce', methods=['POST'])
def get_announce():
    # data validation
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 401
    
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request JSON is empty'}), 402
    
    id_list = data.get('id_list') # list of &CareIDs
    title = data.get('title')
    summary = data.get('summary')

    if not title.strip() or not summary.strip() or not id_list:
        return jsonify({'title': 'Missing details', 'summary': 'All three title, summary, and list of &CareIDs are required'})
    
    # data processing
    response = set_announce(title, summary, id_list)

    return response

# text-to-text elaboration
def rephrase(title, summary):
    messages = []
    if title == '': # retrieved through recording
        messages = [
            {"role": "user", "content": f"Rephrase the following:\n'{summary}'"},
            {"role": "system", "content": "Return a JSON object with the following structure:\n { 'title': <title_content>, 'summary': <summary_content> }"},
        ]
    else:
        messages = [
            {"role": "user", "content": f"On the topic of {title}, rephrase the following:\n'{summary}'\n as a JSON object."},
            {"role": "system", "content": "Return a JSON object with the following structure:\n { 'title': <title_content>, 'summary': <summary_content> }"},
        ]
    start_time = time.time()
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        n=1,
        stop=None,
        response_format={"type":"json_object"},
        temperature=0.2,
        top_p=0.1,
    )
    response_time = time.time() - start_time
    # print("Response time: " + str(round(response_time, 2)) + " sec")
    new_response = response.choices[0].message.content.strip()
    print(response.choices[0].message.content.strip())
    try:
        new_dict_response = json.loads(new_response)
    except:
        return jsonify({'summary':"Invalid JSON format"})
    
    if detect_prompt_injection(new_dict_response.get('title', '')) and detect_prompt_injection(new_dict_response.get('summary', '')):
        default_response = {
            'title': "Sensitive topic detected",
            'summary': "Modify your request",
        }
        return json.dumps(default_response) # required due to Flask Response wrapping
    return new_response

# formatting reminder
def set_reminder(title, summary, date_time): # implementation postponed
    print(f"reached set_reminder with title:{title}")
    messages = []
    if title == "" or date_time == "": # when reminder is set through recording
        messages = [
            {"role": "user", "content": f"Today's date is {datetime.datetime.today()}. Rephrase the following:\n'{summary}'"},
            {"role": "system", "content": "Return a JSON object with the following structure:\n { 'title': <title_content>, 'summary': <summary_content>, 'date_time': <date_time_content> }.\n <date_time_content> is formatted as YYYY-MM-DDThh:mm."},
        ]
    else: # when reminder is set through text submission
        response = rephrase(title, summary)
        try:
            response = json.loads(response)
        except:
            return jsonify({'summary':"Invalid JSON format"})
        
        response["date_time"] = date_time
        return jsonify(response)
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        n=1,
        stop=None,
        response_format={"type":"json_object"},
        temperature=0.2,
        top_p=0.1,
    )
    
    print(response.choices[0].message.content.strip())
    new_response = response.choices[0].message.content.strip()

    try:
        new_dict_response = json.loads(new_response)
    except:
        return jsonify({'summary': "Invalid JSON format"})
    
    if detect_prompt_injection(new_dict_response.get('title', '')) and detect_prompt_injection(new_dict_response.get('summary', '')):
        return jsonify({
            'title': "Sensitive topic detected",
            'summary': "Modify your request",
            'date_time': date_time,
        })

    return new_response

# formatting announce
def set_announce(title, summary, id_list):
    messages = []
    if title == "" or id_list == "": # setting announcement through recording
        messages = [
            {"role": "user", "content": f"Rephrase the following:\n'{summary}'"},
            {"role": "system", "content": "Return a JSON object with the following structure:\n { 'title': <title_content>, 'summary': <summary_content>, 'id_list': [{ 'label': <name>, 'value': &<name> }...] }\n where <name> is the name of recipients."}
        ]
    else: # setting announcement through text submission
        response = rephrase(title, summary)
        try:
            response = json.loads(response)
        except:
            return jsonify({'summary':"Invalid JSON format"})
        
        response["id_list"] = id_list
        return jsonify(response)
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        n=1,
        stop=None,
        response_format={"type":"json_object"},
        temperature=0.2,
        top_p=0.1,
    )

    print(response.choices[0].message.content.strip())
    new_response = response.choices[0].message.content.strip()

    try:
        new_response = json.loads(new_response) # convert to dict
    except:
        return jsonify({'summary':"Invalid JSON format"})

    # converting to lowercase
    new_response["id_list"] = [
        {k.lower(): v.lower() for k, v in d.items()} for d in new_response["id_list"]
        ]
    
    new_response["id_list"] = match_recipients(new_response["id_list"])
    
    if detect_prompt_injection(new_response.get('title', '')) and detect_prompt_injection(new_response.get('summary', '')):
        if id_list == "":
            return jsonify({
                'title': "Sensitive topic detected",
                'summary': "Modify your request",
                'id_list': [],
            })
        else:
            return jsonify({
                'title': "Sensitive topic detected",
                'summary': "Modify your request",
                'id_list': id_list,
            })

    return jsonify(new_response)

# matching generated recipients to intended recipients
def match_recipients(id_list):
    threshold = 0.5
    for idx1, name1 in enumerate(id_list):
        for key1, value1 in name1.items():
            sim_list = [] # similarity list 
            print(f"{key1}: {value1}")
            print()
            for idx2, name2 in enumerate(recipients):
                for key2, value2 in name2.items():
                    print(f"{key2}: {value2}")
                    print()
                    distance = Levenshtein.distance(value1, value2)  # Compare values, not keys
                    max_length = max(len(value1), len(value2))
                    similarity = 1 - (distance / max_length)
                    sim_list.append([similarity, idx2])
            sim_list = sorted(sim_list)
            id_list[idx1] = recipients[sim_list[-1][1]]

    return id_list


# --------------- speech-to-text endpoint -------------------------

# API (paid) version #################
def transcribe(path):
    audio_file = open(path, "rb")
    transcript = client.audio.transcriptions.create(
    model="whisper-1",
    file=audio_file,
    )
    
    print(transcript.text)

    # placeholder value
    response = jsonify({
        'title':'',
        'summary':transcript.text,
    }) 

    # determine notes/reminder/annouce path 
    print(request.path)
    if request.path == "/record":
        response = rephrase("", transcript.text)
    elif request.path == "/record_reminder":
        response = set_reminder("", transcript.text, "")
    elif request.path == "/record_announce":
        response = set_announce("", transcript.text, "")
    else: 
        print("no valid backend route found")

    # clean up
    os.remove(path)
    
    # data processing

    return response

@app.route('/record', methods=['POST'])
def get_record():
    # data validation
    if 'audio' not in request.files:
        return jsonify({'error':'no audio file received'}), 400
    
    audio_file = request.files['audio'] # .FileStorage file
    try:
        audio_file.seek(0)
        temp_path = "liverecording.mp3"
        audio_file.save(temp_path)
        return transcribe(temp_path)
    except Exception as e:
        print(e)
        return jsonify({'error':str(e)}), 500

@app.route('/record_reminder', methods=['POST'])
def get_record_reminder():
    # data validation
    if 'audio' not in request.files:
        return jsonify({'error':'no audio file received'}), 400
    
    audio_file = request.files['audio'] # .FileStorage file
    try:
        audio_file.seek(0)
        temp_path = "liverecording.mp3"
        audio_file.save(temp_path)
        return transcribe(temp_path)
    except Exception as e:
        print(e)
        return jsonify({'error':str(e)}), 500
    
@app.route('/record_announce', methods=['POST'])
def get_record_announce():
    # data validation
    if 'audio' not in request.files:
        return jsonify({'error':'no audio file received'}), 400
    
    audio_file = request.files['audio'] # .FileStorage file
    try:
        audio_file.seek(0)
        temp_path = "liverecording.mp3"
        audio_file.save(temp_path)
        return transcribe(temp_path)
    except Exception as e:
        print(e)
        return jsonify({'error':str(e)}), 500


# run app
if __name__ == '__main__':
    app.run(debug=True)
