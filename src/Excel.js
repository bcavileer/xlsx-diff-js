import Excel from 'exceljs/dist/es5/exceljs.browser'

export const dumpWorkbook = (stream, callback) => {
  const workbook = new Excel.Workbook()
  workbook.xlsx.read(stream)
    .then(() => {
      const rowData = {}
      workbook.eachSheet(worksheet =>
        rowData[worksheet.name] = dumpRowBased(worksheet))

      callback(rowData)
    })
}

const dumpRowBased = worksheet => {
  const worksheetData = {}

  worksheet.eachRow((row, rowNumber) => {
    const rowData = {}

    row.eachCell((cell, colNumber) => {
      const letter = worksheet.columns[colNumber - 1].letter
      rowData[letter] = dumpCell(cell)
    })

    worksheetData[rowNumber] = rowData
  })

  return worksheetData
}

const dumpCell = (cell) => {
  let value = cell.value
  let formula = undefined
  let sharedFormula = undefined

  switch (cell.type) {
    case Excel.ValueType.Null: {
      return
    }
    case Excel.ValueType.Merge: {
      return
    }
    case Excel.ValueType.Number: {
      break
    }
    case Excel.ValueType.String: {
      break
    }
    case Excel.ValueType.Date: {
      value = cell.value.toISOString()
      break
    }
    case Excel.ValueType.Hyperlink: {
      //debugger
      break
    }
    case Excel.ValueType.Formula: {
      value = cell.value.result
      formula = cell.formula
      switch (cell.formulaType) {
        case Excel.FormulaType.Master: {
          break
        }
        case Excel.FormulaType.Shared: {
          sharedFormula = cell.value.sharedFormula
          break
        }
        default: {
          break
        }
      }
      break
    }
    case Excel.ValueType.RichText: {
      value = cell.text
      break
    }
    case Excel.ValueType.Boolean: {
      //debugger
      break
    }
    case Excel.ValueType.Error: {
      //debugger
      break
    }
    default: {
      //debugger
    }
  }

  return { value, formula, sharedFormula }
}
