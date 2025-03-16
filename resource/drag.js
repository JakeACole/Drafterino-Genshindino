// drag-and-drop support

var mousePosition = {
  x: 0,
  y: 0,
};

function enableDragSort(listClass) {
    const sortableLists = document.getElementsByClassName(listClass);
    Array.prototype.map.call(sortableLists, (list) => {enableDragList(list)});
  }
  
  function enableDragList(list) {
    Array.prototype.map.call(list.children, (item) => {enableDragItem(item)});
  }
  
  function enableDragItem(item) {
    item.setAttribute('draggable', true)
    item.ondragstart = handleDragStart;
    item.ondrag = handleDrag;
    item.ondragend = handleDrop;
  }

  function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', 'node');
  }
  
  function handleDrag(item) {
    item.preventDefault();
    let selectedItem = item.target;

    list = selectedItem.parentElement,
    x = item.clientX,
    y = item.clientY;

    if (x == 0 && y == 0) {
      x = mousePosition.x;
      y = mousePosition.y;
    }
    
    selectedItem.classList.add('drag-sort-active');
    let swapItem = document.elementFromPoint(x, y) === null ? selectedItem : document.elementFromPoint(x, y);

    if (list === swapItem.parentElement) {
      swapItem = swapItem !== selectedItem.nextSibling ? swapItem : swapItem.nextSibling;
      list.insertBefore(selectedItem, swapItem);
    }
    else if(swapItem.parentElement && swapItem.parentElement.classList.contains('drag-between-enable') &&
      swapItem.parentElement.classList.contains('drag-sort-enable')) {
        selectedItem.parentElement.removeChild(selectedItem);
        swapItem.parentElement.appendChild(selectedItem);
        swapItem = swapItem !== selectedItem.nextSibling ? swapItem : swapItem.nextSibling;
        swapItem.parentElement.insertBefore(selectedItem, swapItem);
    }

    if (swapItem && swapItem.classList.contains('drag-between-enable')) {
      if (swapItem !== selectedItem.parentElement) {
        selectedItem.parentElement.removeChild(selectedItem);
        swapItem.appendChild(selectedItem);
      }
    }
  }
  
  function handleDrop(item) {
    item.preventDefault();
    let selectedItem = item.target;
    selectedItem.classList.remove('drag-sort-active');
  }

  document.addEventListener("dragover", function (event) {
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
  }, true);