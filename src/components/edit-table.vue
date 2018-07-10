<template>
  <table class="table" style="width: 100%;">
    <thead>
      <tr class="header">
        <th scope = "col" class="rowHeader"></th>
        <th scope = "col" v-for="cIndex in colRange">
          <span v-if="nameCols">{{colNames[cIndex-1]}}</span>
          <span v-else>{{nameCol}}<span class="index">{{cIndex}}</span></span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="rIndex in rowRange">
        <th scope = "row" class="rowHeader">
          <span v-if="nameRows">{{rowNames[rIndex-1]}}</span>
          <span v-else>{{nameRow}}<span class="index">{{rIndex}}</span></span>
        </th>
        <td v-for="cIndex in colRange" :id="[rIndex, cIndex]">{{data[rIndex-1][cIndex-1]}}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import './editabletable.js'

export default {
  name: 'edit-table',
  model: {
    prop: 'data',
    event: 'change'
  },
  props: {
    data: Array,
    nameRow: {
      default: 'A',
      type: String
    },
    nameCol: {
      default: 'B',
      type: String
    },
    colNames: {
      default: () => [],
      type: Array
    },
    rowNames: {
      default: () => [],
      type: Array
    },
  },
  computed: {
    colRange: function () {
      const len = this.data[0].length;
      return Array.from({length: len}, (v, k) => k+1);
    },
    rowRange: function () {
      const len = this.data.length;
      return Array.from({length: len}, (v, k) => k+1);
    },
    nameCols: function () {
      return this.colRange.length == this.colNames.length;
    },
    nameRows: function () {
      return this.rowRange.length == this.rowNames.length
    }
  },
  methods: {
    // This gets the table data
    tableData: function () {
      var tableData = [];
      $(this.$el).find("tr").each(function() {
        var rowData = [];
        var cells = $(this).find('td');
        if (cells.length) {
          cells.each(function() { rowData.push($(this).text()); });
          tableData.push(rowData);
        }
      });

      return tableData;
    },
    makeEditable: function () {
      const vm = this;
      const cells = $(this.$el).find('td');

      // Make the table editable
      $(this.$el).editableTableWidget();

      // Prevent non-numeric entries
      cells.on('validate', function (evt, value) {
          return !isNaN(parseFloat(value)) && isFinite(value);
      });

      // Emit event upon change
      cells.off('change');
      cells.on('change', function(evt, value) {
        var data = vm.tableData();
        const index = evt.target.id.split(',').map((a) => parseInt(a)-1)

        // Modify data to include new value
        data[index[0]][index[1]] = value

        if (vm.data != data) {
          vm.$emit('change', data);
        }
      });
    }
  },
  mounted: function () {
    this.makeEditable();
  },
  updated: function () {
    this.makeEditable();
  }
}
</script>

<style scoped>
th, td {
  text-align: center;
}

.index {
  position: relative;
  top: 0.3em;
  font-size: 0.8em;
}
</style>
