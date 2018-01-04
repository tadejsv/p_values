from django.views.generic import TemplateView
from django.views import View
from django.http import JsonResponse

from .helpers import check_p_val, to_matrix

import numpy as np

class TwoPlayerView(TemplateView):
    template_name = "2players/2players.html"

class TwoPlayerCalculation(View):

    def get(self, request):
        params = request.GET
        a_payoff = np.array(to_matrix(params.getlist('player_a[]'))).astype(float)
        b_payoff = np.array(to_matrix(params.getlist('player_b[]'))).astype(float)
        probabilities = np.array(to_matrix(params.getlist('probabilities[]'))).astype(float)
        p_value = float(params["p_value"])

        result = check_p_val((a_payoff, b_payoff), probabilities, p_value)

        return JsonResponse({"success": result["success"],
                             "matrix": result["x"].tolist(),
                             "dims": probabilities.shape})
