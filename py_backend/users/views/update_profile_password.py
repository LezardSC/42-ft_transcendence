from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from users.decorators import custom_login_required as login_required, is_in_game
from django.contrib.auth.hashers import make_password
from django.contrib.auth import update_session_auth_hash
from django.core.exceptions import ValidationError

from django.http import JsonResponse

from users.utils import decode_json_body
from users.validators import PasswordValidators


@require_http_methods(["POST"])
@requires_csrf_token
@login_required
@is_in_game
def update_profile_password(request):
    data = decode_json_body(request)
    if isinstance(data, JsonResponse):
        return data
    
    if request.user.is_42auth:
        return JsonResponse({'status': "update_42_error_message"}, status=400)
    
    new_password1 = data.get('new_password1')
    new_password2 = data.get('new_password2')

    if not new_password1 or not new_password2:
        return JsonResponse({'status': 'password_missing_message'}, status=400)

    try:
        password_validators = PasswordValidators()
        password_validators.validate(new_password1)
    except:
        return JsonResponse({'error': "password_forbidden_char"}, status=400)

    if new_password1 and new_password2:
        if new_password1 == new_password2:
            hashed_password = make_password(new_password1)
            request.user.password = hashed_password
            request.user.save()
            update_session_auth_hash(request, request.user)

            return JsonResponse({"status": "profile_password_updated_message"}, status=200)
        else:
            return JsonResponse({'status': 'passwords_not_matching_message'}, status=400)
    else:
        return JsonResponse({'status': 'password_missing_message'}, status=400)