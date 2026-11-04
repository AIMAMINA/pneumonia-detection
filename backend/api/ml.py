"""Pneumonia CNN: loading and inference.

The model is loaded lazily on first use so that `manage.py` commands
(migrate, createsuperuser, tests...) start fast and do not need TensorFlow.
"""
import logging
import threading
from pathlib import Path

import numpy as np
from PIL import Image, UnidentifiedImageError

logger = logging.getLogger(__name__)

MODEL_PATH = Path(__file__).resolve().parent.parent / "model" / "cnn_pneumonia_model_binary3.h5"
IMG_SIZE = 150  # must match the training notebook
THRESHOLD = 0.5
LABELS = {0: "Normal", 1: "Pneumonia"}

_model = None
_lock = threading.Lock()


class ModelUnavailable(Exception):
    pass


class InvalidImage(Exception):
    pass


def get_model():
    global _model
    if _model is None:
        with _lock:
            if _model is None:
                try:
                    import tensorflow as tf

                    _model = tf.keras.models.load_model(MODEL_PATH, compile=False)
                except Exception as exc:  # noqa: BLE001
                    logger.exception("Could not load the model from %s", MODEL_PATH)
                    raise ModelUnavailable(str(exc)) from exc
    return _model


def preprocess(file_obj):
    """Same preprocessing as training: grayscale, 150x150, values in [0, 1]."""
    try:
        img = Image.open(file_obj).convert("L").resize((IMG_SIZE, IMG_SIZE))
    except (UnidentifiedImageError, OSError) as exc:
        raise InvalidImage(str(exc)) from exc
    arr = np.asarray(img, dtype="float32") / 255.0
    return arr.reshape((1, IMG_SIZE, IMG_SIZE, 1))


def predict(file_obj):
    arr = preprocess(file_obj)
    prob = float(get_model().predict(arr, verbose=0)[0][0])
    pred_class = int(prob > THRESHOLD)
    confidence = prob if pred_class else 1 - prob
    return {
        "prediction": pred_class,
        "label": LABELS[pred_class],
        "text": "Pneumonia detected" if pred_class else "Normal scan",
        "confidence": round(confidence, 4),
    }
