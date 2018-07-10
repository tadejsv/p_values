from django.views.generic import TemplateView
from django.views import View
from django.http import JsonResponse

from .helpers import check_p_val, full_payoffs, full_probabilities

import numpy as np
import json

class RingView(TemplateView):
    template_name = "ring.html"

class RingCalculation(View):

    def get(self, request):
        params = request.GET
        payoffs = np.array(json.loads(params.get('payoffs'))).astype(float)
        probabilities = np.array(json.loads(params.get('probabilities'))).astype(float)
        probabilities = probabilities.T # Need to transpose
        p_value = float(params["p_value"])

        result = check_p_val(full_payoffs(payoffs),
                             full_probabilities(probabilities),
                             p_value)

        return JsonResponse({"success": result["success"],
                             "matrix": result["x"].tolist(),
                             "dims": probabilities.shape})
