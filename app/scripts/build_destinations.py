import json
from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]

RAW_FILE = BASE_DIR / "app" / "data" / "raw" / "destinations.csv"
PROCESSED_JSON = BASE_DIR / "app" / "data" / "processed" / "destinations.json"
WEB_JSON = BASE_DIR / "web" / "data" / "destinations.json"
WEB_GEOJSON = BASE_DIR / "web" / "data" / "destinations.geojson"


def clean_text(value):
    if pd.isna(value):
        return ""
    return str(value).strip()


def build_json_records(df):
    records = []

    for _, row in df.iterrows():
        record = {
            "id": clean_text(row["id"]),
            "name_ar": clean_text(row["name_ar"]),
            "name_en": clean_text(row["name_en"]),
            "city": clean_text(row["city"]),
            "region": clean_text(row["region"]),
            "category": clean_text(row["category"]),
            "lat": float(row["lat"]),
            "lon": float(row["lon"]),
            "summary_ar": clean_text(row["summary_ar"]),
            "summary_en": clean_text(row["summary_en"]),
            "image": clean_text(row["image"]),
        }
        records.append(record)

    return records


def build_geojson(records):
    features = []

    for item in records:
        feature = {
            "type": "Feature",
            "properties": {
                "id": item["id"],
                "name_ar": item["name_ar"],
                "name_en": item["name_en"],
                "city": item["city"],
                "region": item["region"],
                "category": item["category"],
                "summary_ar": item["summary_ar"],
                "summary_en": item["summary_en"],
                "image": item["image"],
            },
            "geometry": {
                "type": "Point",
                "coordinates": [item["lon"], item["lat"]]
            }
        }

        features.append(feature)

    return {
        "type": "FeatureCollection",
        "name": "Visit Libya Destinations",
        "features": features
    }


def save_json(data, path):
    path.parent.mkdir(parents=True, exist_ok=True)

    with open(path, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)


def main():
    if not RAW_FILE.exists():
        raise FileNotFoundError(f"الملف غير موجود: {RAW_FILE}")

    df = pd.read_csv(RAW_FILE, encoding="utf-8-sig")

    required_columns = [
        "id",
        "name_ar",
        "name_en",
        "city",
        "region",
        "category",
        "lat",
        "lon",
        "summary_ar",
        "summary_en",
        "image",
    ]

    missing_columns = [column for column in required_columns if column not in df.columns]

    if missing_columns:
        raise ValueError(f"أعمدة ناقصة في ملف البيانات: {missing_columns}")

    records = build_json_records(df)
    geojson = build_geojson(records)

    save_json(records, PROCESSED_JSON)
    save_json(records, WEB_JSON)
    save_json(geojson, WEB_GEOJSON)

    print("تم تجهيز بيانات Visit Libya بنجاح.")
    print(f"عدد الوجهات: {len(records)}")
    print(f"ملف JSON للواجهة: {WEB_JSON}")
    print(f"ملف GeoJSON للخريطة: {WEB_GEOJSON}")


if __name__ == "__main__":
    main()
