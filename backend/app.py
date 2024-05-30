import json
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
    response = rephrase(title, summary) # JSON object
    
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

    response = rephrase(title, summary)
    response = json.loads(response) # convert JSON into dictionary
    id_list.append({"key":"value"}) # testing purposes
    response["id_list"] = id_list # add id_list key-value pair

    return jsonify(response)

# text-to-text summarization
def rephrase(title, summary):
    field_of_study = title
    transcription = summary

    messages = [
        {"role": "user", "content": "Articulate the following.\n" + transcription + " Then, return a JSON object with labels 'title' and 'summary'."},
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

    return new_response # JSON object

# formatting reminder
def set_reminder(title, summary, date_time): # implementation postponed
    return




##########################################################
# speech-to-text endpoint

# API (paid) version #################
def transcribe(audio):
    audio_file = open(audio, "rb")
    transcript = client.audio.transcriptions.create(
    model="whisper-1",
    file=audio_file,
    )
    
    print(transcript.text)

    response = {
        'title': "a title",
        'summary': transcript.text,
    }
    return jsonify(response)

@app.route('/record')
def get_record():
    wav_file = "liverecording.wav"
    mp3_file = "liverecording.mp3"
    second = int(input("Enter recording time in seconds: "))
    print("Recording...\n")

    # record live audio
    record_audio = sounddevice.rec(int(second * fs), samplerate=fs, channels=1)
    sounddevice.wait()
    write(wav_file,fs,record_audio)

    print("Recording completed")

    # convert audio to an AudioSegment
    audio = AudioSegment.from_wav(wav_file)

    # save audio as mp3 file
    audio.export(mp3_file,format='mp3')

    return transcribe(wav_file)

    # print(sounddevice.query_devices)





# run app
if __name__ == '__main__':
    app.run(debug=True)




# Local (free) version ##############
# model = whisper.load_model("base")
# result = model.transcribe("translate_test.m4a")
# print(result)
# print(result["text"])