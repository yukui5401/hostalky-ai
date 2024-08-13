# hostalky-ai
This AI demo was used as proof of concept (POC) in the early development of an AI transcription feature at Hostalky. The backend integrates OpenAI's speech-to-text and text-to-text APIs for recording audio and summarizing text. <br />

_This project was used solely for experimental purposes. Do not use in production for security reasons._

### Setup
The backend is powered by Flask. In the terminal run `pip install flask`.

**Setup OpenAI Python Environment** (Recommended)<br />
To set up a virtual python environment for installing OpenAI Python library,
```
python -m venv openai-env
```
then on Windows run,
```
openai-env\Scripts\activate
```
or equivalently on Unix/MacOS,
```
source openai-env/bin/activate
```
**Installing OpenAI Python library**<br />
For Python 3.7.1 or newer versions,
```
pip install --upgrade openai
```
**Setting up OpenAI API key** (Single project)<br />
Create a local `.env` file containing your API key. To setup or access your API key, visit https://platform.openai.com/api-keys.

The `.env` file should include something like
```
OPENAI_API_KEY=<YOUR_API_KEY>
```
In the terminal, `pip install python-dotenv` to load the `.env` file.<br />

### How to start
In the `backend` directory, execute `flask run` to start server on a local host. Then run `npm start` in the root directory to launch the application in your local browser.


