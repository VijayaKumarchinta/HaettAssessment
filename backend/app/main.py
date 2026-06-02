from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Haett Affiliate API Running"}