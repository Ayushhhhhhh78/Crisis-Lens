from flask import Flask, render_template, request
import os
from detect import analyze_disaster

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


@app.route("/", methods=["GET","POST"])
def index():

    results = []

    if request.method == "POST":

        files = request.files.getlist("images")

        for file in files:

            if file.filename == "":
                continue

            filepath = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
            file.save(filepath)

            analysis = analyze_disaster(filepath)

            results.append({
                "filename": file.filename,
                "people": analysis["people"],
                "severity": analysis["severity"],
                "image": "/" + analysis["image"]
            })

    # sort by severity priority
    severity_order = {"High":3,"Medium":2,"Low":1}

    results = sorted(
        results,
        key=lambda x: severity_order[x["severity"]],
        reverse=True
    )

    return render_template("index.html", results=results)


if __name__ == "__main__":
    app.run(debug=True)