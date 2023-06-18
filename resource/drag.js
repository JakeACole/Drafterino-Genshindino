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

    list = selectedItem.parentElement,
    x = event.clientX,
    y = event.clientY;
    
    selectedItem.classList.add('drag-sort-active');
    let swapItem = document.elementFromPoint(x, y) === null ? selectedItem : document.elementFromPoint(x, y);

    if (list === swapItem.parentElement) {
      swapItem = swapItem !== selectedItem.nextSibling ? swapItem : swapItem.nextSibling;
      list.insertBefore(selectedItem, swapItem);
    }

    if (swapItem && swapItem.classList.contains('drag-between-enable')) {
      if (swapItem !== selectedItem.parentElement) {
        selectedItem.parentElement.removeChild(selectedItem);
        swapItem.appendChild(selectedItem);
      }
    }
  }
  
  function handleDrop(item) {
    let selectedItem = item.target;
    selectedItem.classList.remove('drag-sort-active');
  }
