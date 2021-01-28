const dueDate = document.querySelector('#due-date');
const startDate = document.querySelector('#start-date');
const today = new Date();
const weekFromNow = new Date(new Date().setDate(today.getDate() + 7));

class RepairList {
  constructor() {
    this.repairs = [];
    this.repairId = 0;
  }

  addRepair(description, dueDate) {
    const newRepair = new Repair(description, dueDate, this.repairId++)
    this.repairs.push(newRepair);
    this.redraw();
  }

  updateRepair(id, newDescription) {
    const repair = this.repairs.find(repair => repair.id == id);
    repair.description = newDescription;
    this.redraw();
  }

  deleteRepair(id) {
    this.repairs = this.repairs.filter(repair => repair.id != id);
    this.redraw();
  }

  markAsComplete(id) {
    const repair = this.repairs.find(repair => repair.id == id);
    repair.completed = !repair.completed;
    this.redraw();
  }

  clearCompleted() {
    this.repairs = this.repairs.filter(repair => !repair.completed);
    this.redraw();
  }

  redraw() {
    const repairList = document.querySelector('.repair-list');
    repairList.innerHTML = "";
    
    this.repairs.forEach((repair => {
      repairList.insertAdjacentHTML('afterbegin', `
        <li data-id="${repair.id}" class="${repair.completed ? "completed" : ""}">
          <div class="view">
            <input class="toggle" type="checkbox" ${repair.completed ? "checked" : ""}>
            <label>${repair.description}</label>
            ${repair.formattedDueDate()}
            <button class="destroy"></button>
          </div>
        </li>`);
    }));
  }
}

class Repair {
  constructor(description, dueDate, id) {
    this.description = description;    
    this.dueDate = dueDate;
    this.completed = false;
    this.id = id;
  }

  formattedDueDate() { 
    if (isToday(this.dueDate)) {
      return "<div class='date red'>Due: Today!</div>";
    } else if(isTomorrow(this.dueDate)) {
      return "<div class='date yellow'>Due: Tomorrow</div>";
    } else {
      return `
        <div class='date green'>
          Due: ${this.dueDate.toLocaleDateString('en-us', {weekday: "long", month: "long", day: "numeric"})}${nth(this.dueDate.getDate())}
        </div>
      `
    }
  }
}

const isToday = (someDate) => {
  const today = new Date()
  return someDate.getDate() == today.getDate() &&
    someDate.getMonth() == today.getMonth() &&
    someDate.getFullYear() == today.getFullYear()
}

const isTomorrow = (someDate) => {
  const today = new Date()
  return someDate.getDate() == today.getDate() + 1 &&
    someDate.getMonth() == today.getMonth() &&
    someDate.getFullYear() == today.getFullYear()
}

const nth = function(d) {
  if (d > 3 && d < 21) return 'th';
  switch (d % 10) {
    case 1:  return "st";
    case 2:  return "nd";
    case 3:  return "rd";
    default: return "th";
  }
}

const form = document.querySelector('form');
const list = document.querySelector('.repair-list');
const clear = document.querySelector('.clear-completed');
const repairList = new RepairList();

list.addEventListener('click', function(e) {  
  if (e.target.classList.contains('destroy')) {
    repairList.deleteRepair(e.target.closest('li').dataset.id);
  } else if (e.target.classList.contains('toggle')) {
    repairList.markAsComplete(e.target.closest('li').dataset.id);
  } else if (e.target.closest('li') !== null && e.target.nodeName !== "FORM"  && e.target.nodeName !== "INPUT") {
    markAsEdit(e.target.closest('li'));
  }   
});

list.addEventListener('submit', function(e) {
  e.preventDefault();
  const repairInput = e.target.querySelector('input');
  if (repairInput.value !== "") {
    const id = repairInput.closest('li').dataset.id;
    repairList.updateRepair(id, repairInput.value);
  } else {
    error.textContent = `Repair description cannot be blank!`;
  }
})

clear.addEventListener('click', function(e) {  
  repairList.clearCompleted();
});

form.addEventListener('submit', function(e) {
  e.preventDefault();
  const repairInput = e.target.querySelector('#repair');
  const error = document.querySelector('#error');
  const dueDateInput = e.target.querySelector('#due-date');
  const dueDateWithTimezone = new Date(dueDateInput.value + "T06:00")
  error.textContent = "";

  if (repairInput.value !== "") {    
    if (Date.now() < dueDateWithTimezone) {
      repairList.addRepair(repairInput.value, dueDateWithTimezone);
      repairInput.value = "";  
      dueDate.value = weekFromNow.toLocaleDateString('en-CA');
    } else {  
      error.textContent = `Due date cannot be in the past!`;
    }
  } else {
    error.textContent = `Repair description cannot be blank!`;
  }
});

function markAsEdit(repairElement) {
  const value = repairElement.querySelector('label').textContent;
  repairElement.innerHTML = `
    <form id="edit">
      <input type="text" value=${value} autofocus>
    </form>
  `
  repairElement.querySelector('input').focus();

}

dueDate.value = weekFromNow.toLocaleDateString('en-CA');


