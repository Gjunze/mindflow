import {select, event} from 'd3-selection'
import {hierarchy} from 'd3-hierarchy'
import {linkHorizontal} from 'd3-shape'
import tree from 'd3-flextree-v4'
import {zoom, zoomIdentity} from 'd3-zoom'
import {drag} from 'd3-drag'
import {Subject} from 'rxjs/Subject'
import isEqual from 'lodash/isEqual'
import sortBy from 'lodash/sortBy'
import defaults from 'lodash/defaults'
import uuidv4 from 'uuid/v4'

const duration = 600
let scalex = 1.3
let rootScalex = 1
const maxWidth = 100
let did = d => d.id
let lid = l => l.target.id
function scale (p) {
  return p * scalex
}
function floatEqual (f1, f2) {
  return Math.abs(f1 - f2) < 0.0001
}

function sources (d) {
  //console.log('sources', d.source.x, d.source.y, d.source.width)
  if (d.source.parent === null) { // root
    return [0, 0]
  }
  switch (d.source.type) {
    case 'right':
      return [d.source.y + d.source.width, d.source.x + d.source._height / 2.0]
    case 'left':
      return [d.source.y - d.source.width, d.source.x + d.source._height / 2.0]
  }
}

let targets = (function () {
  let m = {
    left: d => [d.target.y, d.target.x + (d.target._height / 2.0)],
    right: d => [d.target.y, d.target.x + (d.target._height / 2.0)]
  }
  return function (d) {
    //console.log('targets', d.target.type, d.target.x, d.target.y, d.target.width)
    return m[d.target.type](d)
  }
})()
const sides = ['left', 'right']
function findById(arr, id) {
  return arr.find(e => e === id)
}

function scales (n) {
  if(!n.parent) {
    // root node
    return
  } else  {
    let {type, parent} = n
    switch(type) {
      case 'left':{
        if(parent.parent) {
          [n.x, n.y] = [(n.x), -scale(n.y)]
        } else {
          [n.x, n.y] = [rootScalex * n.x, - rootScalex * n.y]
        }
        break        
      }
      case 'right': {
        if(parent.parent) {
          [n.x, n.y] = [(n.x), scale(n.y)]
        } else {
          [n.x, n.y] = [rootScalex * n.x, rootScalex * n.y]
        }
        break        
      }
    }
  }
  // left: n => {
  //   if(n.parent && n.parent.parent === null) {
  //     // parent is root
  //     [n.x, n.y] = [rootScalex * n.x, - rootScalex * n.y]
  //   } else
  //     [n.x, n.y] = [scale(n.x), -scale(n.y)]
  // },
  // right: n => {
  //   if(n.parent && n.parent.parent === null) {
  //     // parent is root
  //     [n.x, n.y] = [rootScalex * n.x, rootScalex * n.y]      
  //   }
  // }
}

const clickThreshold = 10
let rectx = (function () {
  let m = {
    left: d => -d.width,
    right: d => 0
  }
  return d => m[d.type](d)
})()
const ulTargets = (function () {
  let m = {
    left: d => d.id === 'left' ? [0, d._height / 2.0] : [-d.width, d._height / 2.0],
    right: d => d.id === 'right' ? [0, d._height / 2.0] : [d.width, d._height / 2.0]
  }
  return d => m[d.type](d)
})()

const diagonal = linkHorizontal()
const underline = linkHorizontal()

function update (state, source) {
  let {g, textLayer, root} = state
  if (!source) {
    source = root
  }
  let nodeData = root.descendants()
  let linkData = root.links()
  let links = g.selectAll('.link')
    .data(linkData, lid)
  const sourcePos = {
    left: [source.y - source.width, source.x + source._height / 2.0],
    right: [source.y + source.width, source.x + source._height / 2.0]
  }
  const source0Pos = {
    left: [source.y0 - source.width, source.x0 + source._height / 2.0],
    right: [source.y0 + source.width, source.x0 + source._height / 2.0]
  }

  // enter
  let nodes = g.selectAll('.node')
    .data(nodeData, did)
  let nodeAdded = nodes
    .enter()
    .append('g')
      .attr('class', 'node')
  nodeAdded
    .style('opacity', 0)
    .attr('transform', d => {
      return `translate(${source0Pos[d.type][0]}, ${source0Pos[d.type][1]})`
    })
  let textNodes = textLayer
    .selectAll('.text')
    .data(nodeData, did)
  // update
  let linkAdded = links.enter()
    .append('path')
    .attr('class', l => {
      if(l.source.parent === null) { // source is root
        return 'root-link link'
      } else {
        return 'link'
      }
    })
    .attr('d', diagonal
              .source(l => source0Pos[l.target.type])
              .target(l => source0Pos[l.target.type]))
    .style('opacity', 0)

  links.merge(linkAdded)
    .transition()
    .duration(duration)
    .style('opacity', 1)
    .attr('d', diagonal.source(sources).target(targets))

  nodes.select('rect')
    .merge(nodeAdded.append('rect'))
      .attr('x', rectx)
      .attr('y', d => -d._height / 2.0)
      .attr('width', d => d.width)
      .attr('height', d => d._height)
  nodes.select('.underline')
    .merge(nodeAdded.append('path')).filter(d => d.parent !== null) // no underline for root
      .attr('class', 'underline').merge(nodes.selectAll('.underline'))
      .attr('d', underline.source(d => [0, d._height / 2.0]).target(ulTargets))
  nodes
    .merge(nodeAdded)
    .transition()
    .duration(duration)
    .attr('transform', d => `translate(${d.y}, ${d.x})`)
    .style('opacity', 1)
  textNodes
    .filter(d => d.parent !== null)
    .call(dragHandler(state))
  textNodes
    .classed('has-link', d => d.content.link)
    .classed('highlighted', d => d.content.highlight)
    .classed('collapsed', d => d._children != null)
    .style('transform', d => {
      let left = d.type === 'left' ? (d.y - d.width) : d.y
      return `translate(${left}px, ${d.x - d._height / 2.0}px)`
    })
    .transition()
    .duration(duration)
    .style('opacity', 1)

  textNodes
    .filter(d => !!d.content.link)
    .select('a')
    .attr('class', 'href pe-7s-link')
    .attr('href',d => d.content.link)
    .attr('target', '_blank')

  // exit
  textNodes
    .exit()
    .classed('show-text', false)
    .style('opacity', d => {
      // console.log('text node exit')
      return 0
    })
  nodes
    .exit()
    .transition()
    .duration(duration)
    .attr('transform', d => `translate(${sourcePos[d.type][0]}, ${sourcePos[d.type][1]})`)
    .style('opacity', d => {
      // console.log('node exit')
      return 0
    })
    .remove()
  links
    .exit()
    .transition()
    .duration(duration)
    .attr('d', diagonal.source(l => sourcePos[l.target.type]).target(l => sourcePos[l.target.type]))
    .remove()
  root.each(d => {
    d.x0 = d.x
    d.y0 = d.y
    d.width0 = d.width
    d._height0 = d._height
  })
}

function buildModel (state, data) {
  data.left = data.left || []
  data.right = data.right || []

  let children = [].concat(data.left, data.right)
  function addType (arr, type) {
    arr.forEach(n => {
      n.type = type
      if (n.children) {
        addType(n.children, type)
      }
    })
  }
  addType(data.left, 'left')
  addType(data.right, 'right')
  let model = {
    id: data.id,
    //name: data.name,
    content: data.content,
    children
  }
  let root = hierarchy(model)
  root.each(n => {
    n.content = n.data.content
    n.id = n.data.id
    n.type = n.data.type
  })
  root.type = 'right'
  state.root = root
}
let treeLayout = tree().nodeSize(d => [d._height, d.width])
  .spacing((a, b) => 3)
export function toggleCollapse (state, d) {
  toggleChildren(d)
  layout(state, false)
  update(state, d)
}

function toggleChildren (d) {
  if (!d.children && !d._children) {
    return
  }
  if (d.children) {
    d._children = d.children
    d.children = null
  } else {
    d.children = d._children
    d._children = null
  }
}

function handleClick (d, i, nodes) {
  let state = this
  if (state.clickTimer) {
    return
  }
  state.clickTimer = setTimeout(
    () => {
      state.events.next({type: 'click', state, node: d, element: nodes[i]})
      state.clickTimer = null
    },
    300
  )
}
function handleDblClick (d, i, nodes) {
  let state = this
  if (state.clickTimer) {
    clearTimeout(state.clickTimer)
    state.clickTimer = null
  }
  state.events.next({type: 'dblclick', state, node: d, element: nodes[i]})
}

function addTextNodes (state) {
  let {textLayer, root} = state
  // save transform before clear it
  // we need to disable transform to calc the real size of text
  // nodes
  let nodes = root.descendants()
  let textNodes = textLayer.selectAll('.text')
    .data(nodes, did)
  let enter = textNodes
    .enter()
      .append('div')    
    enter
      .attr('class', d => {
        if (d.parent === null) { // root
          return 'text root-text'
        } else {
          return 'text'
        }
      })
      .classed('show-text', true)
      .attr('data-id', did)
      .on('click', handleClick.bind(state))
      .on('dblclick', handleDblClick.bind(state))
      .on('mouseenter', (d, i, nodes) => {
        state.events.next({type: 'mouseenter', state, node: d, element: nodes[i]})
      })
      .on('mouseleave', (d, i, nodes) => {
        state.events.next({type: 'mouseleave', state, node: d, element: nodes[i]})
      })
    enter
      .append('div')
      .attr('class', 'inner')
    enter
      .classed('has-link', d => d.content.link)
      .classed('highlighted', d => d.content.highlight)
      
    enter
      .append('a')
      .attr('class', 'href pe-7s-link')
      .filter(d => !!d.content.link)
      .attr('href',d => d.content.link)
      .attr('target', '_blank')
  textNodes.exit().remove()
  return enter
}
const placeHolder = '双击编辑'
function calcTextNodesSize ({textLayer}, nodes) {
  let _transform = textLayer.style('transform')
  textLayer.style('transform', null)
  textLayer.selectAll('.text')
    .data(nodes, did)
    .style('position', 'relative')
    .style('width', null)
    .style('height', null)
    .select('.inner')
    .text(d => d.content.text || placeHolder)
  textLayer.selectAll('.text')
    .each(function (d) {
      let rect = this.getBoundingClientRect()
      d.width = rect.width || 100
      d._height = rect.height || 20
    })
  textLayer.style('transform', _transform)
}

function layout (state, recalc) {
  let {textLayer, root} = state
  let _children = root.children
  let types = ['left', 'right']
  if (_children) {
    types.forEach(type => {
      let children = _children.filter(c => c.type === type)
      let _root = Object.assign(root, {children})
      treeLayout(_root)
    })
  }
  root.children = _children
  root.x0 = root.x = 0
  root.y0 = root.y = -root.width / 2
  textLayer.selectAll('.text')
  .data(root.descendants(), did)
  .each(function (d) {
    select(this)
      .style('position', 'absolute')
      .style('width', d.width + 'px')
      .style('height', d._height + 'px')
    scales(d)
  })  
}

function changeParent (state, n, p) {
  let o = n.parent
  o.children = o.children.filter(c => c !== n)
  n.parent = p
  if (p._children) {
    p._children.push(n)
  } else {
    if (!p.children) {
      p.children = []
    }
    p.children.push(n)
  }
  // d.each(n => { n.type = o.type; console.log('d', d) })
  if(n.type !== p.type)
    n.descendants().forEach(n => { n.type = p.type })
  state.events.next({type: 'parent', parent:p, node: n, oparent: o})
}
function updateType (n, type) {
  n.each(_n => {
    _n.type = type
  })
}
function reorderRoot (state, n) {
  let {root} = state
  if (n.parent !== root) {
    return false
  }
  if (n.type === 'right' && n.y < 0) {
    updateType(n, 'left')
  } else if (n.type === 'left' && n.y > 0) {
    updateType(n, 'right')
  }
  return false
}
function dragOver({textLayer}, d) {
  let {sourceEvent} = event
  let sel = textLayer.selectAll('.text.show-text')
  .filter(n => n.id !== d.id)
  .filter((n, i, nodes) => {
    let e = nodes[i]
    let rect = e.getBoundingClientRect()
    if(sourceEvent.x > rect.x && 
        sourceEvent.y > rect.y && 
        sourceEvent.x < rect.x + rect.width &&
        sourceEvent.y < rect.y + rect.height) {
          return true
        }
  })
  return sel
}

function dragHandler (state) {
  let {g, textLayer, container} = state
  let dragged = null
  return drag()
    .container(container)
    .subject(d => { return {x: d.y, y: d.x} })
    .on('start', (d, i, nodes) => {
      event.sourceEvent.stopPropagation()
    })
    .on('drag', (d, i, nodes) => {
      event.sourceEvent.stopPropagation()
      if (!dragged) {
        let {x, y} = event.subject
        x = Math.abs(x - event.x)
        y = Math.abs(y - event.y)
        if (x + y < clickThreshold) {
          return
        }
        let _nodes = g.selectAll('.node')
          .data(d.descendants(), did)
        let _textNodes = textLayer.selectAll('.text')
          .data(d.descendants(), did)
        let _links = g.selectAll('.link')
          .data(d.links().concat([{source: d.parent, target: d}]), lid)
        _nodes.raise()
        _links.raise()
        dragged = [_nodes, _links, _textNodes]
        state.isDragging = true
        state.events.next({type: 'dragstart', node: d, element: nodes[i]})
      }
      if (dragged) {
        let {x, y} = event.subject
        x = (event.x - x) / state.scaleK
        y = (event.y - y) / state.scaleK
        d.descendants().forEach(n => {
          n.y = n.y0 + x
          n.x = n.x0 + y
        })
        let [_nodes, _links, _textNodes] = dragged
        _textNodes
          .style('transform', d => {
            let left = d.type === 'left' ? (d.y - d.width) : d.y
            let top = d.x - d._height
            return `translate(${left}px, ${top}px)`
          })
        _nodes
          .attr('transform', d => `translate(${d.y}, ${d.x})`)
        _links
          .attr('class', l => l.source.parent ? 'link' : 'root-link link')
          .attr('d', diagonal.source(sources).target(targets))
        state.isDragging = false
        let over = dragOver(state, d)
        if(over.empty()) {
          state.events.next({type: 'drag', node: d})
        } else {
          state.events.next({type: 'dragover', node: d, element: nodes[i], overElement: over.node()})
        }
        
      }
    })
    .on('end', function (d) {
      if (dragged) {
        // let [_nodes, _links] = dragged
        let _links = dragged[1]
        let _nodes = dragged[2]
        _nodes.lower()
        _links.lower()
        let that = this
        let r = this.getBoundingClientRect()
        let sel = dragOver(state, d)
        let [o] = sel.data()
        if (o && o !== d.parent) {
          changeParent(state, d, o)
        } else if (d.parent) {
          reorderRoot(state, d)
          let children = sortBy(d.parent.children, ({type, x}) => {
            // return [(type === 'left' ? 0 : 1), x]
            return x + (type === 'left' ? -1000000 : 0)
          })
          if(!isEqual(children.map(did), d.parent.children.map(did))) {
            d.parent.children = children
            let parent = d.parent
            state.events.next({type: 'reorder', parent})
          }
        }
        state.events.next({type: 'dragend'})
        layout(state, false)
        update(state, o)
      }
    })
}
export function createDiagram (wrapper) {
  let container = document.createElement('div')
  wrapper.appendChild(container)
  container.setAttribute('id', 'mind-tree')
  let svg = select(container)
    .append('svg')
  let g = svg.append('g')
  let textLayer = select(container)
    .append('div')
    .attr('class', 'text-layer')
    const events = new Subject()
    let zoomer = zoom().scaleExtent([0.2, 2])
    .extent([[0, 0], [960, 1080]])
    .on('start', () => events.next({type: 'zoom.start'}))
    .on('end', () => events.next({type: 'zoom.end'}))
  let state = {
    svg, scaleK: 1.0, zoomer, textLayer, g, container, events
  }
  zoomer
    .on('zoom', function (d, i, s) {
      let transform = event.transform
      state.scaleK = transform.k
      svg
        .style('transform', `translate(${transform.x}px,${transform.y}px) scale(${transform.k})`)
        .style('transform-origin', '0 0')
      textLayer // .attr('transform', event.transform)
        .style('transform', `translate(${transform.x}px,${transform.y}px) scale(${transform.k})`)
        .style('transform-origin', '0 0')

      state.events.next({type: 'zoom'})
      if (event.sourceEvent) {
        event.sourceEvent.preventDefault()
      }
    })
  center(state)
  return state
}
function center ({container, zoomer}) {
  let rect = container.getBoundingClientRect()
  select(container)
    .call(zoomer)
    .call(zoomer.transform, zoomIdentity.translate(rect.width / 2, rect.height / 2))
    .on('dblclick.zoom', null)
}
export function loadData (state, data) {
  buildModel(state, data)
  addTextNodes(state)
  calcTextNodesSize(state, state.root.descendants())
  layout(state, true)
  update(state, state.root)
}

function updateAncestorsHeight (node) {
  let height = node.height + 1
  for(let p = node.parent; p; p = p.parent) {
    if(height > p.height) {
      p.height = height
      height += 1
    } else {
      break
    }
  }
}
export function appendChild (state, p, text) {
  let node = hierarchy({})
  node.parent = p
  //node.name = text
  node.content = {text}
  node.height = 0
  if(p) {
    if (p._children) {
      p.children = p._children
      p._children = null
    } else if (!p.children) {
      p.children = []
    }
    node.depth = p['depth'] + 1
    node.type = p.type
    p.children.push(node)
    node.x0 = p.x
    node.y0 = p.y  
  } else {
    node.type = 'right'
    node.children = []
    state.root = node
    node.depth = 0
    node.x0 = node.y0 = 0
  }
  updateAncestorsHeight(node)
  node.id = uuidv4()
  addTextNodes(state)
  calcTextNodesSize(state, [node])
  layout(state, true)
  update(state, p)
  console.log('emit add event', node, p)
  state.events.next({type: 'add', node, parent: p})
}
export function removeChild(state, n) {
  let p = n.parent
  if(p) {
    p.children = p.children.filter(c => c.id !== n.id)
    n.parent = null
  }
  addTextNodes(state)
  layout(state, true)
  update(state, state.root)
  state.events.next({type: 'remove', node: n, parent: p})
}
export function setContent(state, node, content) {
  node.content = content
  calcTextNodesSize(state, [node])
  layout(state, true)
  update(state, node)
  state.events.next({type: 'edit', node})
}
export function centerRoot({container, zoomer}) {
  let rect = container.getBoundingClientRect()
  select(container)
    .call(zoomer.transform, zoomIdentity.translate(rect.width / 2, rect.height / 2))
}

export function appendChildToNodeId(state, nodeId, text){
  let {root} = state
  let [node] = root.descendants().filter(c => c.id === nodeId)
  appendChild(state, node, text)
}
export function deleteNodeId(state, nodeId) {
  console.log('deleteNodeId', nodeId)
  let {root} = state
  let [node] = root.descendants().filter(c => c.id === nodeId)
  if(node) {
    removeChild(state, node)
  }
}
export function appendSiblingToNodeId(state, nodeId, text) {
  console.log('appendSiblingToNodeId', nodeId)
  let {root} = state
  let [node] = root.descendants().filter(c => c.id === nodeId)
  if(node && node.parent) {
    appendChild(state, node.parent, text)
  }
}