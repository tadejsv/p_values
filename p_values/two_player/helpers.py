from scipy.optimize import linprog
from scipy import stats

import numpy as np
import pandas as pd

# This function transforms the javascript array from the ajax function
# to a python matrix

def to_matrix(js_array):
    matrix = []
    for row in js_array:
        matrix += [row.split(",")]

    return(matrix)

# This function checks whether there exists a solution (probabilities of the 2G), given the observed
# probabilities and a proposed p value

def check_p_val(payoffs, probs, p_value):

    #Number of players, moves for all players and the shape of the 1G and 2G (shape means the dimension
    #of the payoff array)
    num_players = len(payoffs)
    num_moves = np.array(probs.shape)
    game_shape = np.zeros(num_moves)
    game2_shape = np.zeros(num_moves*2)

    #Number of total stategy profiles in the normal and doubled game
    dim_game = np.prod(num_moves)
    dim_2game = np.prod(num_moves*2)

    #A function to give, for every 2G index, a corresponding position in 1G
    def orig_game_index(doubled_game_index):
        orig_ind = np.array(doubled_game_index)
        not_orig_game = np.where(orig_ind > num_moves-1)
        orig_ind[not_orig_game] = (orig_ind - num_moves)[not_orig_game]
        return(tuple(orig_ind))

    #Throw error if probabilities do not sum up to 1
    if not np.isclose(1,probs.sum()):
        raise NameError("Probabilities do not sum up to 1 (instead {})".format(probs.sum()))

    #Throw error if some of probabilities are negative
    if(np.any(probs<0)):
        raise NameError("Some probabilities are negative")

    ############################
    # Inequalities
    ############################

    #Optimality of rational moves
    opt_coef = np.zeros((np.sum(num_moves*(num_moves-1)),dim_2game))

    # Incentive constraints for rational types in the doubled game
    # What we do here is that for each player, for each of his rational moves, for each of alternative
    # rational moves, we make a constraint such that for each strategy profile of other players,
    # the coefficient of the probability in the doubled game corresponding to the original rational move
    # and the strategy profile of other players is equal to the payoff under the alternative move minus
    # the payoff under the original move (given other players' strategies), as the here the
    # constraint has to be smaller or equal to 0

    for player in range(num_players): #loop over players
        moves = [x for x in range(num_moves[player])]
        for move in moves: #loop over player's rational moves
            i = 0
            for alt_move in (moves[:move] + moves[move+1:]): #loop over alternative rational moves of the player
                coefs = np.zeros(num_moves*2)
                # Below we loop over all the possible moves of other players
                for ind, val in np.ndenumerate(game2_shape.take(0, player)):
                    # Here we just get the index of the strategy profile of the original and the alternative
                    # move (given other players' moves) in the n-dimensional doubled game matrix
                    full_ind = tuple(np.concatenate((ind[:player], [move], ind[player:])).astype(np.int))
                    full_ind_alt = tuple(np.concatenate((ind[:player], [alt_move], ind[player:])).astype(np.int))

                    # Here we set the coefficient of the probability for the original move (give other
                    # player's moves) to be equal to the payoff in case of alternative move - the payoff
                    # in case of original move (as the equation has to be smaller than 0)
                    orig_move_pay = payoffs[player][orig_game_index(full_ind)]
                    alt_move_pay = payoffs[player][orig_game_index(full_ind_alt)]
                    coefs[full_ind] = alt_move_pay - orig_move_pay

                # Here we flatten the n-dimensional matrix into a row of probabilities so it can be used
                # as a constraint
                current_ind = np.sum(num_moves[:player]*(num_moves[:player]-1)) + move*(num_moves[player]-1) + i
                opt_coef[current_ind, :] = coefs.flatten()

                i =+ 1

    p_coef = np.zeros((np.sum(2*num_moves), dim_2game))

    # p-rationality constraints for all types of the doubled game
    # Here we add for each player, for each of his moves in the doubled game, a constraint such that
    # for each profile of strategies of other players, we set the coefficient to either the p
    # value (if the strategy p rofile of other players here is not in the rational set) or
    # p value - 1 (if the strategy profile is in the rational set), again because the constraint
    # has to be smaller or equal to 0

    for player in range(num_players): # loop over players
        for move in range(2*num_moves[player]): # loop over the player's moves in the doubled game
            coefs = np.zeros(num_moves*2)
            for ind, val in np.ndenumerate(game2_shape.take(0, player)): # loop over other players' str. prof.
                ind = np.array(ind)
                full_ind = tuple((np.concatenate((ind[:player], [move], ind[player:]))).astype(np.int))

                # If other players' strategy profile is rational (all moves in 1G part of 2G), set coefficient
                # to p-1, otherwise to p
                if np.all(ind <= np.concatenate((num_moves[:player], num_moves[player+1:]))-1):
                    coefs[full_ind] = p_value - 1
                else:
                    coefs[full_ind] = p_value

            p_coef[np.sum(num_moves[:player])*2+move,:] = coefs.flatten()

    #Concatenate all inequality restrictions together
    ineq_coef = np.concatenate([opt_coef, p_coef])
    ineq_sols = np.zeros((opt_coef.shape[0] + p_coef.shape[0]))

    ############################
    # Equalities
    ############################

    #Margin on A equals observed probabilities (also implicitly sum=1)
    marg_prob_coef = np.zeros((dim_game, dim_2game), dtype=np.int)
    i = 0

    for ind, val in np.ndenumerate(game_shape):
        coefs = np.zeros(num_moves*2)
        for ind2, val2 in np.ndenumerate(game2_shape):
            if(np.all(orig_game_index(ind2) == ind)):
                coefs[ind2] = 1

        marg_prob_coef[i, :] = coefs.flatten()
        i += 1

    marg_prob_sol = np.zeros(num_moves)
    for ind, val in np.ndenumerate(game_shape):
        marg_prob_sol[ind] = probs[ind]
    marg_prob_sol = marg_prob_sol.reshape(dim_game, 1)

    #Concatenate all equality restrictions (in case there are more)
    eq_coef = marg_prob_coef
    eq_sols = marg_prob_sol

    # Try to find a solution
    sol = linprog(c = [0] * dim_2game, A_ub = ineq_coef, b_ub = ineq_sols,
            A_eq = eq_coef, b_eq = eq_sols, bounds=(0,1), method="interior-point")
    return(sol)
