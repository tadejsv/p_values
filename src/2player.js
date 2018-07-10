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

// Data for examples (from the paper)
const examples = [
  // Penalty kicks
  {
    'payoffsA': [[58,95],[93,70]],
    'payoffsB': [[42,5], [7,30]],
    'probabilities': [[0.168, 0.232], [0.252, 0.348]]
  },
  // Kreps game
  {
    'payoffsA': [[200,0,10,20],[0,10,30,50]],
    'payoffsB': [[50,45,30,-250], [-250,-100,30,40]],
    'probabilities': [[0.178, 0.054, 0.452, 0], [0.082, 0.026, 0.208, 0]]
  },
  // Matching pennies
  {
    'payoffsA': [[80,40],[40,80]],
    'payoffsB': [[40,80],[80,40]],
    'probabilities': [[0.230, 0.250], [0.250, 0.270]]
  },
  // Asymmetric matching pennies
  {
    'payoffsA': [[320,40],[40,80]],
    'payoffsB': [[40,80],[80,40]],
    'probabilities': [[0.154, 0.806], [0.006, 0.034]]
  },
  // Inspection game (chimps)
  {
    'payoffsA': [[0,2],[2,0]],
    'payoffsB': [[4,0],[0,1]],
    'probabilities': [[0.112, 0.1], [0.414, 0.374]]
  },
  // Inspection game (humans)
  {
    'payoffsA': [[0,2],[2,0]],
    'payoffsB': [[4,0],[0,1]],
    'probabilities': [[0.227, 0.190], [0.318, 0.265]]
  },
  // 2 rounds dom. solvable
  {
    'payoffsA': [[75,42],[48,89]],
    'payoffsB': [[42,27],[80,68]],
    'probabilities': [[0.791, 0.066], [0.132, 0.011]]
  },
  // 3 rounds dom. solvable
  {
    'payoffsA': [[53,24],[79,42],[28,71]],
    'payoffsB': [[86,19],[57,73],[23,50]],
    'probabilities': [[0, 0], [0.181, 0.604], [0.050, 0.165]]
  },
]


var demo = new Vue({
  el: '#app',
  components: {
    EditTable,
    Counter,
  },
  data: {
    // Data input stuff
    playerAStrategies: 2,
    playerBStrategies: 2,
    maxStrategies: 16,
    probabilities: [[0.25, 0.25], [0.25, 0.25]],
    payoffsA: [[1, 0], [0, 0]],
    payoffsB: [[0, 0], [0, 1]],

    // Calculation stuff
    calculating: false,
    calculated: false,
    probabilitiesError: false,
    buttonStatus: 'Calculate',
    bisection: {
      lower: 0,
      upper: 1,
      middle: 0.5,
      step: 0,
      numSteps: 10
    },
  },
  watch: {
    playerAStrategies: function () {
      this.recalculateTables();
    },
    playerBStrategies: function () {
      this.recalculateTables();
    }
  },
  methods: {
    recalculateTables: function () {
      this.probabilities = adjustTable(this.probabilities,
        this.playerAStrategies,
        this.playerBStrategies);

      this.payoffsA = adjustTable(this.payoffsA,
        this.playerAStrategies,
        this.playerBStrategies);

      this.payoffsB = adjustTable(this.payoffsB,
        this.playerAStrategies,
        this.playerBStrategies);
  },
  calculate: function () {
    const tableSum = this.probabilities.reduce((a, b) => a + b.reduce((a, b) => a + parseFloat(b), 0), 0);
    if (Math.abs(tableSum-1) < 10e-3) {
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
      $.ajax({
        method: "GET",
        url: 'calculation',
        data: {
          "player_a": JSON.stringify(this.payoffsA),
          "player_b": JSON.stringify(this.payoffsB),
          "probabilities": JSON.stringify(this.probabilities),
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
    this.playerAStrategies = examples[ind].payoffsA.length;
    this.playerBStrategies = examples[ind].payoffsA[0].length;

    this.payoffsA = examples[ind].payoffsA.slice();
    this.payoffsB = examples[ind].payoffsB.slice();
    this.probabilities = examples[ind].probabilities.slice();

    this.calculate();
  }
}
})
