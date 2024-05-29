from flask import Flask, request, jsonify
from openai import OpenAI
import time
import datetime
client = OpenAI()

# initialize Flask app
app = Flask(__name__)

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

    if not title or not summary:
        return jsonify({'error': 'Both title and summary are required'}), 400
    
    
    # data processing
    response = transcribe(title, summary) # JSON object
    
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

    if not title or not summary or not date_time:
        return jsonify({'error': 'All three title, summary, and date_time are required'}), 403
    
    # data processing
    response = {
        'title':title,
        'summary':summary + " " + summary,
        'date_time':date_time,
    }
    return jsonify(response)

# announce page
@app.route('/announce', methods=['POST'])
def get_announce():
    # data validation
    if not request.is_json():
        return jsonify({'error': 'Request must be JSON'}), 401
    
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request JSON is empty'}), 402
    
    title = data.get('title')
    summary = data.get('summary')
    id_list = data.get('id_list') # list of &CareIDs

    if not title or not summary or not id_list:
        return jsonify({'error': 'All three title, summary, and list of &CareIDs are required'}), 403
    
    # data processing
    response = {
        'title':title,
        'summary':summary + summary,
        'id_list':id_list, # array
    }

    return response

# text-to-text summarization
def transcribe(title, summary):
    field_of_study = title
    transcription = summary

    messages = [
        {"role": "user", "content": "Articulate the following.\n" + transcription + "Then, return a JSON object with labels 'title' and 'summary'."},
        {"role": "system", "content": "You are an AI health assistant for: " + field_of_study}
    ]
    start_time = time.time()

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        n=1,
        stop=None,
        response_format={"type":"json_object"}
    )
    response_time = time.time() - start_time
    # print("Response time: " + str(round(response_time, 2)) + " sec")

    new_response = response.choices[0].message.content.strip()
    # print(response.choices[0].message.content.strip())

    return new_response

# formatting reminder
def set_reminder(title, summary, date_time): # implementation postponed
    return

# run app
if __name__ == '__main__':
    app.run(debug=True)

  