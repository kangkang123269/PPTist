import { nodes } from 'prosemirror-schema-basic'
import type { Node, NodeSpec } from 'prosemirror-model'
import { listItem as _listItem } from 'prosemirror-schema-list'

interface Attr {
  [key: string]: number | string
}

const orderedList: NodeSpec = {
  attrs: {
    order: {
      default: 1,
    },
    listStyleType: {
      default: '',
    },
  },
  content: 'list_item+',
  group: 'block',
  parseDOM: [
    { 
      tag: 'ol', 
      getAttrs: dom => {
        const order = ((dom as HTMLElement).hasAttribute('start') ? (dom as HTMLElement).getAttribute('start') : 1) || 1
        const attr: Attr = { order: +order }

        const { listStyleType } = (dom as HTMLElement).style
        if (listStyleType) attr['listStyleType'] = listStyleType

        return attr
      }
    }
  ],
  toDOM: (node: Node) => {
    const { order, listStyleType } = node.attrs
    let style = ''
    if (listStyleType) style += `list-style-type: ${listStyleType};`

    const attr: Attr = { style }
    if (order !== 1) attr['start'] = order


    return ['ol', attr, 0]
  },
}

const bulletList: NodeSpec = {
  attrs: {
    listStyleType: {
      default: '',
    },
  },
  content: 'list_item+',
  group: 'block',
  parseDOM: [
    {
      tag: 'ul',
      getAttrs: dom => {
        const { listStyleType } = (dom as HTMLElement).style
        return listStyleType ? { listStyleType } : {}
      }
    }
  ],
  toDOM: (node: Node) => {
    const { listStyleType } = node.attrs
    let style = ''
    if (listStyleType) style += `list-style-type: ${listStyleType};`

    return ['ul', { style }, 0]
  },
}

const listItem: NodeSpec = {
  ..._listItem,
  content: 'paragraph block*',
  group: 'block',
}

const paragraph: NodeSpec = {
  attrs: {
    align: {
      default: '',
    },
    indent: {
      default: 0,
    },
    textIndent: {
      default: 0,
    },
  },
  content: 'inline*',
  group: 'block',
  parseDOM: [
    {
      tag: 'p',
      getAttrs: dom => {
        const { textAlign, textIndent } = (dom as HTMLElement).style

        let align = (dom as HTMLElement).getAttribute('align') || textAlign || ''
        align = /(left|right|center|justify)/.test(align) ? align : ''

        let textIndentLevel = 0
        if (textIndent) {
          if (/em/.test(textIndent)) {
            textIndentLevel = parseInt(textIndent)
          }
          else if (/px/.test(textIndent)) {
            textIndentLevel = Math.floor(parseInt(textIndent) / 20)
            if (!textIndentLevel) textIndentLevel = 1
          }
        }

        const indent = +((dom as HTMLElement).getAttribute('data-indent') || 0)
      
        return { align, indent, textIndent: textIndentLevel }
      }
    },
    {
      tag: 'img',
      ignore: true,
    },
    {
      tag: 'pre',
      skip: true,
    },
  ],
  toDOM: (node: Node) => {
    const { align, indent, textIndent } = node.attrs
    let style = ''
    if (align && align !== 'left') style += `text-align: ${align};`
    if (textIndent) style += `text-indent: ${textIndent * 20}px;`

    const attr: Attr = { style }
    if (indent) attr['data-indent'] = indent

    return ['p', attr, 0]
  },
}

// https://github.com/pipipi-pikachu/PPTist/issues/134
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { hard_break, ...otherNodes } = nodes

export default {
  ...otherNodes,
  'ordered_list': orderedList,
  'bullet_list': bulletList,
  'list_item': listItem,
  paragraph,
}
