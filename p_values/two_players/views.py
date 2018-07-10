from django.views.generic import TemplateView
from django.views import View
from django.http import JsonResponse

from .helpers import check_p_val

import numpy as np
import json

class TwoPlayerView(TemplateView):
    template_name = "2players.html"

class TwoPlayerCalculation(View):

    def get(self, request):
        params = request.GET
        a_payoff = np.array(json.loads(params.get('player_a'))).astype(float)
        b_payoff = np.array(json.loads(params.get('player_b'))).astype(float)
        probabilities = np.array(json.loads(params.get('probabilities'))).astype(float)
        p_value = float(params.get("p_value"))

        result = check_p_val((a_payoff, b_payoff), probabilities, p_value)

        return JsonResponse({"success": result["success"],
                             "matrix": result["x"].tolist(),
                             "dims": probabilities.shape})
