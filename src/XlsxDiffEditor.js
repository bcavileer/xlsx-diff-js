import React from 'react'
import { diff as DiffEditor } from 'react-ace'
import { dumpWorkbook } from './Excel'
import 'brace/mode/javascript'
import 'brace/theme/github'
import fileReaderStream from 'filereader-stream'

export default class XlsxDiffEditor extends React.Component {
  constructor (props) {
    super(props)
    const initialValue = '"Drop your XLSX"'

    this.state = {
      leftJson: null,
      rightJson: null,
      leftValue: initialValue,
      rightValue: initialValue
    }

    this.setContent = this.setContent.bind(this)
  }

  scrollSync ({ session: s1 }, { session: s2 }) {
    s1.on('changeScrollTop', function () {
      s2.setScrollTop(s1.getScrollTop())
    })
  }

  handleDrop ({ container }, side) {
    const { setContent } = this

    container.addEventListener(
      'dragover',
      function (e) {
        e.preventDefault()
        e.stopPropagation()
      }
    )

    container.addEventListener(
      'dragenter',
      function (e) {
        e.preventDefault()
        e.stopPropagation()
      }
    )

    container.addEventListener(
      'drop',
      function (e) {
        if (e.dataTransfer && e.dataTransfer.files.length) {
          e.preventDefault()
          e.stopPropagation()
          const file = e.dataTransfer.files[0]
          const stream = fileReaderStream(file)
          dumpWorkbook(stream, (json) => setContent(side, json))
        }
      }
    )
  }

  onEditorLoad ({ $editors }) {
    const leftEditor = $editors[0]
    const rightEditor = $editors[1]
    this.scrollSync(leftEditor, rightEditor)
    this.scrollSync(rightEditor, leftEditor)
    this.handleDrop(leftEditor, 'leftJson')
    this.handleDrop(rightEditor, 'rightJson')
  }

  setContent (side, content) {
    this.setState({ [side]: content }, this.computeDiff)
  }

  computeDiff () {
    const { leftJson, rightJson } = this.state

    if (!rightJson) {
      return this.setState({ leftValue: 'Now drop right side...' })
    }

    if (!leftJson) {
      return this.setState({ rightValue: 'Now drop left side...' })
    }

    this.setState({
      leftValue: this.diffJson(leftJson, rightJson),
      rightValue: this.diffJson(rightJson, leftJson)
    })
  }

  diffJson (l, r) {
    const diff = []
    const lC = Object.keys(l)
    const rC = Object.keys(r)

    lC.forEach((c) => {
      if (!rC.includes(c)) diff.push('Contains')
    })

    return diff.join('\n')
  }

  render () {
    const { leftValue, rightValue } = this.state
    return <DiffEditor
      value={[leftValue, rightValue]}
      mode="javascript"
      readOnly={true}
      onLoad={this.onEditorLoad.bind(this)}
      width={'100%'}
      height={'100%'}
      editorProps={{ $blockScrolling: Infinity }}
    />
  }
}
