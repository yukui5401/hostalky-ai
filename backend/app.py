import json
import os
from flask import Flask, request, jsonify
from openai import OpenAI
import time
import datetime

import sounddevice # for audio recording
from scipy.io.wavfile import write # for saving recorded audio
from pydub import AudioSegment

fs = 44100 # sample rate, for audio quality

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
    # response = elaborate(summary) # JSON object
    response = elaborate(summary)
    
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
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 401
    
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request JSON is empty'}), 402
    
    id_list = data.get('id_list') # list of &CareIDs
    title = data.get('title')
    summary = data.get('summary')

    if not title or not summary or not id_list:
        return jsonify({'error': 'All three title, summary, and list of &CareIDs are required'}), 403
    
    # data processing
    # response = {
    #     'id_list':id_list, # array
    #     'title':title,
    #     'summary':summary,
    # }

    response = elaborate(summary)
    response = json.loads(response) # convert JSON into dictionary
    id_list.append({"key":"value"}) # testing purposes
    response["id_list"] = id_list # add id_list key-value pair

    return jsonify(response)

# text-to-text elaboration
def elaborate(summary):
    messages = [
        {"role": "user", "content": f"Rephrase the following:\n{summary}\n Return a JSON object with labels 'title' and 'summary'."},
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
    # print(response.choices[0].message.content.strip())

    return new_response # JSON object

# text-to-text revision
def revise(summary):
    response = client.completions.create(
        model="gpt-3.5-turbo-instruct",
        prompt=summary,
        max_tokens=200, # required as default is 16
        n=1,
        stop=None,
    )
    print(response.choices[0].text)
    
    return jsonify({
        'title': "A title",
        'summary':response.choices[0].text,
    })

# formatting reminder
def set_reminder(title, summary, date_time): # implementation postponed
    return




##########################################################
# speech-to-text endpoint

# API (paid) version #################
def transcribe(path):
    audio_file = open(path, "rb")
    transcript = client.audio.transcriptions.create(
    model="whisper-1",
    file=audio_file,
    )
    
    print(transcript.text)

    # response = elaborate(transcript.text)
    response = elaborate(transcript.text)

    # clean up
    os.remove(path)
    
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

    # mp3_audio = AudioSegment.from_file(audio_file, format="mp3")
    # ogg_audio = AudioSegment.from_file(audio_file, format="ogg")


    # python audio recording (backend version)
    # wav_file = "liverecording.wav"
    # mp3_file = "liverecording.mp3"
    # second = int(input("Enter recording time in seconds: "))
    # print("Recording...\n")

    # # record live audio
    # record_audio = sounddevice.rec(int(second * fs), samplerate=fs, channels=1)
    # sounddevice.wait()
    # write(wav_file,fs,record_audio)

    # print("Recording completed")

    # # convert audio to an AudioSegment
    # audio = AudioSegment.from_wav(wav_file)

    # # save audio as mp3 file
    # audio.export(mp3_file,format='mp3')


    # print(sounddevice.query_devices)





# run app
if __name__ == '__main__':
    app.run(debug=True)




# Local (free) version ##############
# model = whisper.load_model("base")
# result = model.transcribe("translate_test.m4a")
# print(result)
# print(result["text"])