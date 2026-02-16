#!/usr/bin/env python3
"""
ClassPulse - Auto-generate student responses for testing.

Usage:
  # Create a new session and submit 10 fake responses:
  python seed_student_responses.py --count 10

  # Use an existing session (e.g. from admin dashboard):
  python seed_student_responses.py --session-id abc12345 --count 15

  # Submit responses slowly (2 sec between each) to simulate real students:
  python seed_student_responses.py --count 8 --delay 2

  # Custom base URL (e.g. deployed backend):
  python seed_student_responses.py --base-url https://your-app.railway.app --count 5

Requires: httpx (pip install httpx) or run from backend venv.
"""

import argparse
import random
import sys
import time

try:
    import httpx
except ImportError:
    print("Error: httpx is required. Run: pip install httpx")
    print("Or activate the backend venv: cd backend && venv\\Scripts\\activate")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Fake data
# ---------------------------------------------------------------------------

FIRST_NAMES = [
    "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn",
    "Sam", "Jamie", "Drew", "Blake", "Cameron", "Skyler", "Reese", "Parker",
    "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason",
    "Isabella", "William", "Mia", "James", "Charlotte", "Benjamin",
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Rodriguez", "Martinez", "Wilson", "Anderson", "Taylor",
    "Thomas", "Moore", "Jackson", "Martin", "Lee", "Thompson", "White",
]

# Generic answer building blocks - combined to create varied responses
ANSWER_STARTERS = [
    "I think that",
    "In my opinion,",
    "From what I've learned,",
    "Based on my experience,",
    "I believe",
    "It seems to me that",
    "I would say that",
    "One thing I've noticed is",
    "Personally, I feel",
    "I've found that",
]

ANSWER_BODIES = [
    "the key is to consider multiple perspectives and stay open-minded.",
    "we need to balance theory with practical application.",
    "collaboration and communication are essential for success.",
    "it helps to break things down into smaller, manageable steps.",
    "understanding the fundamentals makes everything else easier.",
    "there's often more than one right approach to a problem.",
    "feedback and iteration lead to better outcomes.",
    "context matters a lot—what works in one situation may not in another.",
    "we should question assumptions and look for evidence.",
    "connecting ideas across different areas can lead to new insights.",
    "practice and repetition build confidence over time.",
    "asking questions is just as important as having answers.",
    "diversity of thought strengthens the overall result.",
    "we need to be mindful of unintended consequences.",
    "simplicity often beats complexity when possible.",
]

ANSWER_CLOSERS = [
    "That's my take on it.",
    "Would love to hear others' thoughts.",
    "Curious what the rest of the class thinks.",
    "Hope this adds to the discussion.",
    "",
    "",
    "",
]  # Some closers are empty for variety


def random_student_name() -> str:
    """Generate a random student name."""
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    return f"{first} {last}"


def random_answer(question: str = "") -> str:
    """Generate a plausible random answer. Optionally use question for context."""
    parts = [
        random.choice(ANSWER_STARTERS),
        random.choice(ANSWER_BODIES),
        random.choice(ANSWER_CLOSERS),
    ]
    answer = " ".join(p for p in parts if p).strip()
    # Add slight question-specific flavor if provided
    if question and random.random() < 0.3:
        # Sometimes prepend a short reference to the question
        refs = ["Regarding this, ", "On this topic, ", "For this question, "]
        answer = random.choice(refs) + answer[0].lower() + answer[1:]
    return answer


def create_session(base_url: str, question: str, frontend_url: str | None = None) -> dict:
    """Create a new session and return session info."""
    resp = httpx.post(
        f"{base_url}/api/sessions",
        json={"question": question},
        timeout=10.0,
    )
    resp.raise_for_status()
    data = resp.json()
    print(f"Created session: {data['session_id']}")
    print(f"  Student URL: {data['student_url']}")
    admin_link = f"{frontend_url}/session/{data['session_id']}/admin?token={data['admin_token']}" if frontend_url else data["admin_url"]
    print(f"  Admin URL:   {admin_link}")
    return data


def submit_response(base_url: str, session_id: str, student_name: str, answer: str) -> dict:
    """Submit a single student response."""
    resp = httpx.post(
        f"{base_url}/api/sessions/{session_id}/responses",
        json={"student_name": student_name, "answer": answer},
        timeout=10.0,
    )
    resp.raise_for_status()
    return resp.json()


def main():
    parser = argparse.ArgumentParser(
        description="Auto-generate student responses for ClassPulse testing",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--base-url",
        default="http://localhost:8000",
        help="Backend API base URL (default: http://localhost:8000)",
    )
    parser.add_argument(
        "--frontend-url",
        help="Frontend URL for admin link (default: same as base-url). Use http://localhost:5173 when running Vite dev server.",
    )
    parser.add_argument(
        "--session-id",
        help="Use existing session ID. If omitted, creates a new session.",
    )
    parser.add_argument(
        "--question",
        default="What is one key takeaway from today's class?",
        help="Question for new session (ignored if --session-id is set)",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=10,
        help="Number of fake responses to submit (default: 10)",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.5,
        help="Seconds between each submission (default: 0.5)",
    )
    parser.add_argument(
        "--no-delay",
        action="store_true",
        help="Submit all at once with no delay",
    )
    args = parser.parse_args()

    base_url = args.base_url.rstrip("/")
    frontend_url = (args.frontend_url or base_url).rstrip("/")
    delay = 0 if args.no_delay else args.delay

    # Get or create session
    admin_url = None
    if args.session_id:
        session_id = args.session_id
        # Verify session exists and get question
        try:
            resp = httpx.get(f"{base_url}/api/sessions/{session_id}", timeout=5.0)
            resp.raise_for_status()
            question = resp.json().get("question", "")
            print(f"Using existing session: {session_id}")
            print(f"  Question: {question[:60]}{'...' if len(question) > 60 else ''}")
        except httpx.HTTPStatusError as e:
            print(f"Error: Session {session_id} not found ({e.response.status_code})")
            sys.exit(1)
    else:
        data = create_session(base_url, args.question, frontend_url)
        session_id = data["session_id"]
        admin_token = data.get("admin_token", "")
        admin_url = f"{frontend_url}/session/{session_id}/admin?token={admin_token}" if admin_token else None
        question = args.question

    # Submit fake responses
    print(f"\nSubmitting {args.count} fake student responses...")
    used_names: set[str] = set()

    for i in range(args.count):
        name = random_student_name()
        while name in used_names:
            name = random_student_name()
        used_names.add(name)

        answer = random_answer(question)
        try:
            result = submit_response(base_url, session_id, name, answer)
            print(f"  [{i + 1}/{args.count}] {name}: {answer[:50]}...")
        except httpx.HTTPStatusError as e:
            print(f"  [{i + 1}/{args.count}] FAILED: {e.response.status_code} - {e.response.text}")
        except Exception as e:
            print(f"  [{i + 1}/{args.count}] ERROR: {e}")

        if delay and i < args.count - 1:
            time.sleep(delay)

    print(f"\nDone! Open the admin dashboard to see the summarized themes.")
    if admin_url:
        print(f"  {admin_url}")
    else:
        print(f"  {frontend_url}/session/{session_id}/admin?token=<your-admin-token>")


if __name__ == "__main__":
    main()
