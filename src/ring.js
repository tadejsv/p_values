import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/js/dist/collapse.js';
import 'bootstrap/js/dist/dropdown.js';

import Vue from 'vue/dist/vue.min.js';

import EditTable from './components/edit-table.vue';
import Counter from './components/counter.vue';

// Adjust the old table, either expanding it (padding it by 0s) or
// shrinking it according to the new dimensions
function adjustTable(oldTable, newRows, newColumns) {
  const oldRows = oldTable.length,
  oldCols = oldTable[0].length;
  var newData = new Array(newRows);

  for (var i = 0; i < newRows; i++) {
    newData[i] = new Array(newColumns);
  }

  for (var i = 0; i < newRows; i++) {
    for (var j = 0; j < newColumns; j++) {
      newData[i][j] = 0;
      if( i < oldRows && j < oldCols) {
        newData[i][j] = oldTable[i][j]
      }
    }
  }

  return newData;
};

// Filter to show the required number of decimals
Vue.filter('round', function round(value, accuracy, keep) {
  if (typeof value !== 'number') return value;

  var fixed = value.toFixed(accuracy);

  return keep ? fixed : +fixed;
});

// Get all indices of occurences of an element in array
function getAllIndexes(arr, val) {
    var indexes = [], i;
    for(i = 0; i < arr.length; i++)
        if (arr[i] === val)
            indexes.push(i);
    return indexes;
}

// Data for the example
const examples = [
  // Ring 1
  {
    'payoffs': [
      [[8,20,12], [0,8,16], [18,12,6]],
      [[14,18,4], [20,8,14], [0,16,18]],
      [[20,14,8], [16,2,18], [0,16,16]],
      [[12,16,14],[8,12,10], [6,10,8]]
    ],
    'probabilities': [[0.9, 0.1, 1, 1], [0.1, 0.9, 0, 0], [0,0,0,0]]
  },
]


var demo = new Vue({
  el: '#app',
  components: {
    EditTable,
    Counter
  },
  data: {
    // Data input stuff
    numPlayers: 3,
    numStrategies: 2,
    names: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    payoffs: [
       [[0,1],[1,0]],
       [[0,1],[1,0]],
       [[0,1],[1,0]],
    ],
    probabilities: [[0.5,0,0], [0, 0.25, 0.25]],

    // Calculation stuff
    calculating: false,
    calculated: false,
    probabilitiesError: false,
    buttonStatus: 'Calculate',
    errorMessage: '',
    bisection: {
      lower: 0,
      upper: 1,
      middle: 0.5,
      step: 0,
      numSteps: 10
    },
  },
  watch: {
    numPlayers: function () {
      this.recalculateTables();
    },
    numStrategies: function () {
      this.recalculateTables();
    }
  },
  computed: {
    rowNames: function () {
      const rowRange = Array.from({length: this.numStrategies}, (v, k) => k+1);
      return rowRange.map((a) => 'Action ' + a);
    },
    colNames: function () {
      return this.names.slice(0, this.numPlayers)
    },
    playerRange: function () {
      return [...Array(this.numPlayers).keys()]
    }
  },
  methods: {
    recalculateTables: function () {
      const currentLen = this.payoffs.length;
      const nStr = this.numStrategies;
      const nPly = this.numPlayers;

      for(var i = 0; i < nPly; i++) {
        if(i < currentLen) {
          this.payoffs[i] = adjustTable(this.payoffs[i], nStr, nStr)
        } else {
          this.payoffs[i] = adjustTable([0], nStr, nStr)
        }
      }

      this.payoffs = this.payoffs.slice(0, nPly);
      this.probabilities = adjustTable(this.probabilities, nStr, nPly);
    },
    calculate: function () {
      // Check if the probabilities of all players sum up to 1

      var sumProbs = Array(this.numPlayers);
      for(var i = 0; i < this.numPlayers; i++) {
        var sum = 0;
        for(var j = 0; j < this.numStrategies; j++) {
          sum += parseFloat(this.probabilities[j][i]);
        }
        sumProbs[i] = sum;
      }

      var sumTo1 = Array(this.numPlayers);
      sumProbs.forEach((a, index) => {sumTo1[index] = (Math.abs(a-1) < 10e-3)})

      if (sumTo1.every((a) => a)) {
        this.calculated = false;
        this.calculating = true;
        this.probabilitiesError = false;

        this.bisection.step = 0;
        this.bisection.lower = 0;
        this.bisection.upper = 1;
        this.bisection.middle = 0.5;

        this.calculate_step(null);
      } else {
        this.probabilitiesError = true;
        this.calculated = false;

        const errorIndices = getAllIndexes(sumTo1, false);
        var message = 'Probabilities do not sum up to 1 for player(s) ';
        errorIndices.forEach((a) => {message = message + this.names[a] + ', '});
        message = message.substring(0,message.length-2) + '!';

        this.errorMessage = message;
      }
    },
    calculate_step: function (result) {
      if (result) {
        if(result["success"]) {
          this.bisection.lower = this.bisection.middle;
        } else {
          this.bisection.upper = this.bisection.middle;
        }
        this.bisection.middle = (this.bisection.lower + this.bisection.upper)/2;
      }

      // If we reached the last step in the bisection
      if(this.bisection.step == this.bisection.numSteps) {
        this.calculating = false;
        this.calculated = true;
        this.buttonStatus = "Calculate";
      } else {
        const vm = this;

        // Gather probabilities of all players
        $.ajax({
          method: "GET",
          url: 'calculation',
          data: {
            "payoffs": JSON.stringify(this.payoffs),
            "probabilities":  JSON.stringify(this.probabilities),
            "p_value": this.bisection.middle
          },
          success: function(data, textStatus, jqXHR) {
            vm.calculate_step(data);
          }
        });

        this.buttonStatus = "Calculating... (" + (this.bisection.step+1) + " out of 10)";
        this.bisection.step++;
      }
    },
    // Set the date to the example and calculate values
    setExample: function (ind) {
      this.numPlayers = examples[ind].payoffs.length;
      this.numStrategies = examples[ind].payoffs[0].length;

      this.payoffs = examples[ind].payoffs.slice();
      this.probabilities = examples[ind].probabilities.slice();

      this.calculate();
    }
  }
})
