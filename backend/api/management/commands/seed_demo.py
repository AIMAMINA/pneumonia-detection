import datetime

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from api.models import AvailableDate, AvailableTime, Profile

SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]


class Command(BaseCommand):
    help = "Create appointment slots for the next weekdays and a demo user."

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=14, help="Number of weekdays to open")

    def handle(self, *args, days, **options):
        times = [
            AvailableTime.objects.get_or_create(time=datetime.time.fromisoformat(t))[0]
            for t in SLOTS
        ]

        day, created = timezone.localdate(), 0
        while created < days:
            day += datetime.timedelta(days=1)
            if day.weekday() >= 5:  # skip weekends
                continue
            available_date, _ = AvailableDate.objects.get_or_create(date=day)
            available_date.available_times.set(times)
            created += 1

        User = get_user_model()
        user, new = User.objects.get_or_create(username="demo", defaults={"email": "demo@elhakim.local"})
        if new:
            user.set_password("DemoPass123!")
            user.save()
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.uses_left = max(profile.uses_left, 3)
        profile.save()

        self.stdout.write(self.style.SUCCESS(
            f"{days} days x {len(SLOTS)} slots ready. Demo account: demo / DemoPass123! (3 free scans)"
        ))
