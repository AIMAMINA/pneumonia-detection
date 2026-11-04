import datetime
import io
import shutil
import tempfile
from unittest import mock

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.utils import timezone
from PIL import Image
from rest_framework.test import APITestCase

from .models import Appointment, AvailableDate, AvailableTime, ContactMessage, Profile, UserScan

User = get_user_model()
TMP_MEDIA = tempfile.mkdtemp()

FAKE_RESULT = {"prediction": 1, "label": "Pneumonia", "text": "Pneumonia detected", "confidence": 0.97}


def make_image(name="xray.png"):
    buf = io.BytesIO()
    Image.new("L", (200, 200), color=128).save(buf, format="PNG")
    return SimpleUploadedFile(name, buf.getvalue(), content_type="image/png")


class AuthTests(APITestCase):
    def test_register_then_login_with_username_or_email(self):
        res = self.client.post("/api/user/register/", {
            "username": "amina", "email": "Amina@Example.com", "password": "Str0ng-Passw0rd!",
        })
        self.assertEqual(res.status_code, 201)
        self.assertNotIn("password", res.data)
        self.assertTrue(Profile.objects.filter(user__username="amina").exists())

        for identifier in ("amina", "amina@example.com"):
            res = self.client.post("/api/token/", {"username": identifier, "password": "Str0ng-Passw0rd!"}, format="json")
            self.assertEqual(res.status_code, 200, identifier)
            self.assertIn("access", res.data)

    def test_register_rejects_weak_password_and_duplicate_email(self):
        User.objects.create_user("taken", "taken@example.com", "Str0ng-Passw0rd!")
        res = self.client.post("/api/user/register/", {"username": "x", "email": "y@example.com", "password": "123"})
        self.assertEqual(res.status_code, 400)
        res = self.client.post("/api/user/register/", {
            "username": "other", "email": "taken@example.com", "password": "Str0ng-Passw0rd!",
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("email", res.data)

    def test_wrong_password(self):
        User.objects.create_user("amina", "a@example.com", "Str0ng-Passw0rd!")
        res = self.client.post("/api/token/", {"username": "amina", "password": "nope"}, format="json")
        self.assertEqual(res.status_code, 401)

    def test_api_root(self):
        self.assertEqual(self.client.get("/").status_code, 200)


class ContactTests(APITestCase):
    def test_submit_contact(self):
        res = self.client.post("/api/submit/", {
            "first_name": "A", "last_name": "B", "email": "a@b.com", "phone": "0600000000",
            "subject": "symptoms", "message": "Hello",
        }, format="json")
        self.assertEqual(res.status_code, 201)
        self.assertEqual(ContactMessage.objects.get().get_subject_display(), "Symptoms Inquiry")

    def test_invalid_subject(self):
        res = self.client.post("/api/submit/", {
            "first_name": "A", "last_name": "B", "email": "a@b.com", "phone": "1",
            "subject": "whatever", "message": "Hello",
        }, format="json")
        self.assertEqual(res.status_code, 400)


class AppointmentTests(APITestCase):
    def setUp(self):
        self.t9 = AvailableTime.objects.create(time=datetime.time(9))
        self.t10 = AvailableTime.objects.create(time=datetime.time(10))
        self.t11 = AvailableTime.objects.create(time=datetime.time(11))  # not offered
        self.day = AvailableDate.objects.create(date=timezone.localdate() + datetime.timedelta(days=2))
        self.day.available_times.set([self.t9, self.t10])

    def book(self, time):
        return self.client.post("/api/appointments/", {
            "full_name": "Amina", "phone_number": "0600000000", "date": self.day.pk, "time": time.pk,
        }, format="json")

    def test_times_follow_the_date_and_bookings(self):
        url = f"/api/available-times/?date={self.day.date.isoformat()}"
        self.assertEqual([t["time"] for t in self.client.get(url).data], ["09:00", "10:00"])

        self.assertEqual(self.book(self.t9).status_code, 201)
        self.assertEqual([t["time"] for t in self.client.get(url).data], ["10:00"])

    def test_cannot_double_book_or_pick_unoffered_time(self):
        self.assertEqual(self.book(self.t9).status_code, 201)
        self.assertEqual(self.book(self.t9).status_code, 400)
        self.assertEqual(self.book(self.t11).status_code, 400)

    def test_cancelled_slot_can_be_rebooked(self):
        self.book(self.t9)
        Appointment.objects.update(status="cancelled")
        self.assertEqual(self.book(self.t9).status_code, 201)

    def test_bad_date_param(self):
        self.assertEqual(self.client.get("/api/available-times/?date=nope").status_code, 400)


@override_settings(MEDIA_ROOT=TMP_MEDIA)
class ScanTests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TMP_MEDIA, ignore_errors=True)

    def setUp(self):
        self.user = User.objects.create_user("amina", "a@example.com", "Str0ng-Passw0rd!")
        self.client.force_authenticate(self.user)

    def test_requires_auth(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get("/api/profile/").status_code, 401)

    def test_no_credits_means_402(self):
        res = self.client.post("/api/predict-scan/", {"scan": make_image()}, format="multipart")
        self.assertEqual(res.status_code, 402)

    @mock.patch("api.ml.predict", return_value=FAKE_RESULT)
    def test_payment_then_predict_saves_scan(self, _predict):
        res = self.client.post("/api/fake-payment/")
        self.assertEqual(res.data["total_uses"], 3)

        res = self.client.post("/api/predict-scan/", {"scan": make_image()}, format="multipart")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["uses_left"], 2)
        self.assertEqual(res.data["label"], "Pneumonia")

        scan = UserScan.objects.get(user=self.user)
        self.assertEqual(scan.ai_result, "Pneumonia")
        self.assertEqual(len(self.client.get("/api/user/scans/").data), 1)

        pdf = self.client.get(f"/api/user/scans/{scan.pk}/report/")
        self.assertEqual(pdf.status_code, 200)
        self.assertEqual(pdf["Content-Type"], "application/pdf")
        self.assertTrue(b"".join(pdf.streaming_content if pdf.streaming else [pdf.content]).startswith(b"%PDF"))

    def test_invalid_image(self):
        Profile.objects.create(user=self.user, uses_left=1)
        bad = SimpleUploadedFile("x.png", b"not an image", content_type="image/png")
        res = self.client.post("/api/predict-scan/", {"scan": bad}, format="multipart")
        self.assertEqual(res.status_code, 400)
        self.assertEqual(Profile.objects.get(user=self.user).uses_left, 1)

    @mock.patch("api.ml.predict", return_value=FAKE_RESULT)
    def test_analyze_only_own_scans(self, _predict):
        mine = UserScan.objects.create(user=self.user, scan_name="mine", scan_file=make_image())
        other_user = User.objects.create_user("other", "o@example.com", "Str0ng-Passw0rd!")
        theirs = UserScan.objects.create(user=other_user, scan_name="theirs", scan_file=make_image())

        self.assertEqual(self.client.post(f"/api/user/scans/{mine.pk}/analyze/").status_code, 200)
        self.assertEqual(self.client.post(f"/api/user/scans/{theirs.pk}/analyze/").status_code, 404)
        self.assertEqual(self.client.get(f"/api/user/scans/{theirs.pk}/report/").status_code, 404)

    def test_dashboard_stats_is_staff_only(self):
        self.client.force_authenticate(None)
        res = self.client.get("/api/dashboard-stats/")
        self.assertEqual(res.status_code, 302)  # redirected to admin login
