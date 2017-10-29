# Expressionist
An authoring tool for text generation in games. Currently in pre-release alpha. Feel free to email James for more info.

## Getting Started

This project requires `npm` and `python >= 2.7.10`

```bash
git clone [URL of this repo]
cd [to/cloned/repo]
pip install -r requirements.txt
npm install
npm run build
python __init__.py
[navigate to localhost:5000 with a web browser]
```

## To Develop The Front-End

Any modifications to .jsx files: `npm run build`

To reduce compile times of .jsx files: `npm run build -- --watch`

(`-- --watch` will leave a daemon running in the background.)
