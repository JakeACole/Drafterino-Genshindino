// drag-and-drop support

function enableDragSort(listClass) {
    const sortableLists = document.getElementsByClassName(listClass);
    Array.prototype.map.call(sortableLists, (list) => {enableDragList(list)});
  }
  
  function enableDragList(list) {
    Array.prototype.map.call(list.children, (item) => {enableDragItem(item)});
  }
  
  function enableDragItem(item) {
    item.setAttribute('draggable', true)
    item.ondrag = handleDrag;
    item.ondragend = handleDrop;
  }
  
  function handleDrag(item) {
    let selectedItem = item.target;
    if(!selectedItem.classList.contains('draggable')) {
        selectedItem = selectedItem.parentElement;
    }

    list = selectedItem.parentElement,
    x = event.clientX,
    y = event.clientY;
    
    selectedItem.classList.add('drag-sort-active');
    let swapItem = document.elementFromPoint(x, y) === null ? selectedItem : document.elementFromPoint(x, y);
    if (swapItem.parentElement) {
        if(!swapItem.classList.contains('draggable')) {
            swapItem = swapItem.parentElement;
        }

    
        if (list === swapItem.parentElement) {
          swapItem = swapItem !== selectedItem.nextSibling ? swapItem : swapItem.nextSibling;
          list.insertBefore(selectedItem, swapItem);
        }
    }
    
  }
  
  function handleDrop(item) {
    let selectedItem = item.target;
    if(!selectedItem.classList.contains('draggable')) {
        selectedItem = selectedItem.parentElement;
    }
    selectedItem.classList.remove('drag-sort-active');
  }
