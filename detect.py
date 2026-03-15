from ultralytics import YOLO
import cv2
import os
import uuid

model = YOLO("yolov8n.pt")

def analyze_disaster(image_path):

    print("\n==============================")
    print("Processing image:", image_path)

    results = model(image_path)
    result = results[0]

    people = 0
    vehicles = 0

    print("Detected objects:")

    for box in result.boxes:

        cls = int(box.cls[0])
        conf = float(box.conf[0])

        label = model.names[cls]

        print(f" - {label} | confidence: {conf:.2f}")

        if cls == 0:
            people += 1

        if cls in [2,3,5,7]:
            vehicles += 1


    print("People detected:", people)
    print("Vehicles detected:", vehicles)


    crowd_emergency = 1 if people > 6 else 0
    accident_signal = 1 if vehicles > 3 else 0

    print("Crowd emergency:", crowd_emergency)
    print("Accident signal:", accident_signal)


    severity_score = (
        people * 5 +
        vehicles * 3 +
        crowd_emergency * 5 +
        accident_signal * 4
    )

    print("Severity score:", severity_score)

    if severity_score > 30:
        severity = "High"
    elif severity_score > 15:
        severity = "Medium"
    else:
        severity = "Low"

    print("Final severity:", severity)


    img = result.plot()

    filename = f"result_{uuid.uuid4().hex}.jpg"
    output_path = os.path.join("static", filename)

    cv2.imwrite(output_path, img)

    print("Saved result image:", output_path)
    print("==============================\n")


    return {
        "people": people,
        "vehicles": vehicles,
        "severity": severity,
        "score": severity_score,
        "image": output_path
    }