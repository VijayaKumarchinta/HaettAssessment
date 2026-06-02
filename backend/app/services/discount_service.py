import random
import string


def generate_discount_code(
    business_name: str
):
    prefix = (
        business_name.upper()
        .replace(" ", "")
        [:6]
    )

    suffix = ''.join(
        random.choices(
            string.digits,
            k=4
        )
    )

    return f"{prefix}{suffix}"