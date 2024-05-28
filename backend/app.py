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

# text-to-text summarization
def transcribe(title, summary):
    field_of_study = title
    transcription = summary

    messages = [
        {"role": "user", "content": "Summarize the following.\n" + transcription + " Return a JSON object with labels 'title' and 'summary'."},
        {"role": "system", "content": "You are an AI health assistant in: " + field_of_study}
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

# run app
if __name__ == '__main__':
    app.run(debug=True)