(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const money = amount => 'R' + Math.round(Number(amount) || 0).toLocaleString('en-ZA');
  const safeNumber = input => Math.max(0, Number(input.value) || 0);

  // Responsive navigation
  const menuToggle = $('#menuToggle');
  const nav = $('#primaryNav');
  menuToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  $$('.nav-link').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    $$('.nav-link').forEach(item => item.classList.toggle('active', item === link));
  }));

  // Wedding date countdown
  const dateInput = $('#weddingDate');
  function updateCountdown() {
    if (!dateInput.value) { $('#countdown').textContent = '—'; $('#countdown').nextElementSibling.textContent = 'choose a wedding date'; return; }
    const [year, month, day] = dateInput.value.split('-').map(Number);
    const target = Date.UTC(year, month - 1, day);
    const now = new Date();
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const days = Math.round((target - today) / 86400000);
    $('#countdown').textContent = days >= 0 ? days.toLocaleString('en-ZA') : '♥';
    $('#countdown').nextElementSibling.textContent = days > 0 ? 'days until your wedding' : (days === 0 ? 'your special day is today!' : 'a beautiful day to remember');
  }
  dateInput.addEventListener('change', updateCountdown);
  updateCountdown();

  // Checklist progress
  const checklistItems = $$('#checklist input[type="checkbox"]');
  function updateChecklist() {
    const done = checklistItems.filter(input => input.checked).length;
    const total = checklistItems.length;
    $('#taskProgress').textContent = `${done} of ${total}`;
    $('#taskProgressBar').style.width = `${total ? done / total * 100 : 0}%`;
    $('#checklistCount').textContent = `${done} / ${total} done`;
  }
  checklistItems.forEach(input => input.addEventListener('change', updateChecklist));
  updateChecklist();

  // Budget calculator
  const expenseInputs = $$('#expenseList input[type="number"]');
  const budgetLimit = $('#budgetLimit');
  function updateBudget() {
    const total = expenseInputs.reduce((sum, input) => sum + safeNumber(input), 0);
    const limit = safeNumber(budgetLimit);
    const remaining = limit - total;
    $('#expenseTotal').textContent = money(total);
    $('#remainingTotal').textContent = (remaining < 0 ? '−' : '') + money(Math.abs(remaining));
    $('#dashboardBudget').textContent = money(limit);
    const percentage = limit > 0 ? Math.min(100, total / limit * 100) : (total > 0 ? 100 : 0);
    $('#budgetProgressBar').style.width = `${percentage}%`;
    const message = $('#budgetMessage');
    if (limit === 0 && total > 0) message.textContent = 'Add a total budget to see how your expenses compare.';
    else if (remaining < 0) message.textContent = `You are ${money(Math.abs(remaining))} over budget. Consider adjusting an expense.`;
    else if (remaining === 0) message.textContent = 'You have allocated your full budget.';
    else message.textContent = `You have ${money(remaining)} left to allocate.`;
  }
  expenseInputs.forEach(input => input.addEventListener('input', updateBudget));
  budgetLimit.addEventListener('input', updateBudget);
  $('#resetBudget').addEventListener('click', () => {
    [30000, 25000, 10000, 15000, 10000, 10000].forEach((value, i) => expenseInputs[i].value = value);
    budgetLimit.value = 100000;
    updateBudget();
  });
  updateBudget();

  // Venue/vendor search and category filters
  const vendorSearch = $('#vendorSearch');
  const vendorCategory = $('#vendorCategory');
  function filterVendors() {
    const query = vendorSearch.value.trim().toLowerCase();
    const category = vendorCategory.value;
    let visible = 0;
    $$('.vendor-card').forEach(card => {
      const matchesText = card.dataset.search.includes(query) || card.querySelector('h3').textContent.toLowerCase().includes(query);
      const matchesCategory = category === 'all' || card.dataset.category === category;
      const show = matchesText && matchesCategory;
      card.hidden = !show;
      if (show) visible++;
    });
    $('#noVendors').hidden = visible !== 0;
  }
  vendorSearch.addEventListener('input', filterVendors);
  vendorCategory.addEventListener('change', filterVendors);

  // Local demo favourites
  $$('.favorite-btn').forEach(button => button.addEventListener('click', () => {
    const isFavorite = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', String(!isFavorite));
    button.textContent = isFavorite ? '♡' : '♥';
    $('#favoriteCount').textContent = $$('.favorite-btn[aria-pressed="true"]').length;
  }));

  // Accessible supplier details dialog
  const dialog = $('#vendorDialog');
  $$('.details-btn').forEach(button => button.addEventListener('click', () => {
    $('#dialogTitle').textContent = button.dataset.name;
    $('#dialogText').textContent = button.dataset.detail;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else alert(button.dataset.name + '\n\n' + button.dataset.detail);
  }));
  const closeDialog = () => { if (dialog.open) dialog.close(); };
  $('#dialogClose').addEventListener('click', closeDialog);
  $('#dialogOk').addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });

  // Guest list interactions
  const guestBody = $('#guestTableBody');
  const guestForm = $('#guestForm');
  function statusClass(status) { return status.toLowerCase(); }
  function refreshGuestStats() {
    const rows = $$('tr', guestBody);
    const statuses = rows.map(row => $('.rsvp-select', row).value);
    const attending = statuses.filter(s => s === 'Accepted').length;
    const pending = statuses.filter(s => s === 'Pending').length;
    const declined = statuses.filter(s => s === 'Declined').length;
    $('#attendingCount').textContent = attending;
    $('#pendingCount').textContent = pending;
    $('#declinedCount').textContent = declined;
    $('#guestCountPill').textContent = `${rows.length} guest${rows.length === 1 ? '' : 's'}`;
    $('#dashboardGuests').textContent = rows.length;
    rows.forEach(row => {
      const select = $('.rsvp-select', row);
      select.className = 'rsvp-select ' + statusClass(select.value);
    });
  }
  function addGuest(name, email, status) {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    const strong = document.createElement('strong');
    strong.textContent = name;
    nameCell.appendChild(strong);
    const small = document.createElement('small');
    small.textContent = email || 'Guest';
    nameCell.appendChild(small);
    const statusCell = document.createElement('td');
    const select = document.createElement('select');
    select.className = 'rsvp-select';
    select.setAttribute('aria-label', name + ' RSVP status');
    ['Pending', 'Accepted', 'Declined'].forEach(value => {
      const option = document.createElement('option');
      option.value = value; option.textContent = value;
      if (value === status) option.selected = true;
      select.appendChild(option);
    });
    statusCell.appendChild(select);
    const actionCell = document.createElement('td');
    const remove = document.createElement('button');
    remove.type = 'button'; remove.className = 'remove-guest'; remove.textContent = '×';
    remove.setAttribute('aria-label', 'Remove ' + name);
    actionCell.appendChild(remove);
    row.append(nameCell, statusCell, actionCell);
    guestBody.appendChild(row);
  }
  guestForm.addEventListener('submit', event => {
    event.preventDefault();
    const name = $('#guestName').value.trim();
    const email = $('#guestEmail').value.trim();
    const status = $('#guestStatus').value;
    if (!name) { $('#guestFeedback').textContent = 'Please enter a guest name.'; return; }
    addGuest(name, email, status);
    guestForm.reset();
    $('#guestFeedback').textContent = `${name} has been added to the demo guest list.`;
    refreshGuestStats();
  });
  guestBody.addEventListener('change', event => {
    if (event.target.matches('.rsvp-select')) refreshGuestStats();
  });
  guestBody.addEventListener('click', event => {
    const button = event.target.closest('.remove-guest');
    if (!button) return;
    const row = button.closest('tr');
    const name = $('strong', row).textContent;
    row.remove();
    $('#guestFeedback').textContent = `${name} was removed from the demo guest list.`;
    refreshGuestStats();
  });
  $('#shareGuestSummary').addEventListener('click', () => {
    const rows = $$('tr', guestBody);
    const accepted = rows.filter(row => $('.rsvp-select', row).value === 'Accepted').length;
    const pending = rows.filter(row => $('.rsvp-select', row).value === 'Pending').length;
    const declined = rows.filter(row => $('.rsvp-select', row).value === 'Declined').length;
    $('#guestSummary').textContent = `Summary: ${rows.length} guests listed — ${accepted} attending, ${pending} awaiting reply, ${declined} unable to attend.`;
  });
  refreshGuestStats();

  // Browser-local storage helpers for the new prototype features.
  const readStore = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (_) { return fallback; } };
  const writeStore = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} };

  // Wedding timeline: add, complete and remove dated milestones.
  let milestones = readStore('everafter-timeline', [
    {title:'Book the venue',date:'2027-03-20',owner:'Both partners',done:false},
    {title:'Choose photographer',date:'2027-05-01',owner:'Partner 1',done:false},
    {title:'Send invitations',date:'2027-08-20',owner:'Partner 2',done:false}
  ]);
  function renderTimeline(){
    const list=$('#timelineList'); list.replaceChildren();
    milestones.sort((a,b)=>(a.date||'').localeCompare(b.date||''));
    milestones.forEach((m,i)=>{
      const row=document.createElement('div');row.className='timeline-item'+(m.done?' task-done':'');
      const check=document.createElement('input');check.type='checkbox';check.checked=!!m.done;check.setAttribute('aria-label','Mark '+m.title+' complete');
      check.addEventListener('change',()=>{m.done=check.checked;writeStore('everafter-timeline',milestones);renderTimeline();});
      const details=document.createElement('div'),title=document.createElement('strong'),meta=document.createElement('small');title.textContent=m.title;meta.textContent=`Due ${m.date||'date not set'} · ${m.owner||'Both partners'}`;
      if(!m.done&&m.date&&m.date<new Date().toISOString().slice(0,10))meta.className='overdue';details.append(title,meta);
      const remove=document.createElement('button');remove.type='button';remove.className='remove-guest';remove.textContent='×';remove.setAttribute('aria-label','Remove '+m.title);remove.addEventListener('click',()=>{milestones.splice(i,1);writeStore('everafter-timeline',milestones);renderTimeline();});row.append(check,details,remove);list.append(row);
    });$('#timelineCount').textContent=`${milestones.length} milestone${milestones.length===1?'':'s'}`;
  }
  $('#timelineForm').addEventListener('submit',e=>{e.preventDefault();milestones.push({title:$('#timelineTitle').value.trim(),date:$('#timelineDate').value,owner:$('#timelineOwner').value,done:false});writeStore('everafter-timeline',milestones);renderTimeline();e.currentTarget.reset();$('#timelineFeedback').textContent='Milestone added to this browser’s timeline.';});renderTimeline();

  // Seating plan with guest assignment and table capacity.
  let seatingTables=readStore('everafter-seating-tables',[{name:'Table 1',seats:8,guests:[]},{name:'Table 2',seats:8,guests:[]}]);
  function currentGuestNames(){return $$('tr',guestBody).map(row=> $('strong',row).textContent);}
  function renderSeating(){
    const grid=$('#seatingGrid');if(!grid)return;grid.replaceChildren();const names=currentGuestNames();
    seatingTables.forEach((table,index)=>{
      table.guests=(table.guests||[]).filter(name=>names.includes(name));const card=document.createElement('article');card.className='seating-table';
      const title=document.createElement('h3');title.textContent=table.name;const meta=document.createElement('p');meta.className='table-meta';meta.textContent=`${table.guests.length} of ${table.seats} seats filled`;card.append(title,meta);
      table.guests.forEach(name=>{const line=document.createElement('div');line.className='seat-guest';const text=document.createElement('span');text.textContent=name;const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','Remove '+name+' from '+table.name);remove.addEventListener('click',()=>{table.guests=table.guests.filter(n=>n!==name);writeStore('everafter-seating-tables',seatingTables);renderSeating();});line.append(text,remove);card.append(line);});
      const form=document.createElement('form');form.className='seat-assign';const select=document.createElement('select');select.setAttribute('aria-label','Choose guest for '+table.name);const blank=document.createElement('option');blank.value='';blank.textContent='Choose guest…';select.append(blank);
      names.filter(name=>!seatingTables.some(t=>(t.guests||[]).includes(name))).forEach(name=>{const opt=document.createElement('option');opt.value=name;opt.textContent=name;select.append(opt);});const add=document.createElement('button');add.type='submit';add.textContent='Assign';form.append(select,add);
      form.addEventListener('submit',e=>{e.preventDefault();if(!select.value)return;if(table.guests.length>=Number(table.seats)){meta.textContent='Table is full. Add another table or increase capacity.';return;}table.guests.push(select.value);writeStore('everafter-seating-tables',seatingTables);renderSeating();});card.append(form);
      const removeTable=document.createElement('button');removeTable.type='button';removeTable.className='subtle-button';removeTable.style.marginTop='12px';removeTable.textContent='Remove table';removeTable.addEventListener('click',()=>{seatingTables.splice(index,1);writeStore('everafter-seating-tables',seatingTables);renderSeating();});card.append(removeTable);grid.append(card);
    });writeStore('everafter-seating-tables',seatingTables);
  }
  $('#tableForm').addEventListener('submit',e=>{e.preventDefault();seatingTables.push({name:$('#tableName').value.trim(),seats:Number($('#tableSeats').value),guests:[]});writeStore('everafter-seating-tables',seatingTables);e.currentTarget.reset();$('#tableSeats').value=8;renderSeating();});
  guestBody.addEventListener('change',renderSeating);guestBody.addEventListener('click',()=>setTimeout(renderSeating,0));renderSeating();

  // Partner task board and shared notes (stored locally; no live multi-device sync).
  let sharedTasks=readStore('everafter-partner-tasks',[]),sharedNotes=readStore('everafter-partner-notes',[]);
  function renderCollab(){const list=$('#collabList');list.replaceChildren();sharedTasks.forEach((task,index)=>{const row=document.createElement('div');row.className='timeline-item'+(task.done?' task-done':'');const check=document.createElement('input');check.type='checkbox';check.checked=!!task.done;check.setAttribute('aria-label','Mark '+task.title+' complete');check.addEventListener('change',()=>{task.done=check.checked;writeStore('everafter-partner-tasks',sharedTasks);renderCollab();});const details=document.createElement('div'),title=document.createElement('strong'),meta=document.createElement('small');title.textContent=task.title;meta.textContent=`${task.owner}${task.date?' · Due '+task.date:''}`;details.append(title,meta);const remove=document.createElement('button');remove.type='button';remove.className='remove-guest';remove.textContent='×';remove.setAttribute('aria-label','Remove '+task.title);remove.addEventListener('click',()=>{sharedTasks.splice(index,1);writeStore('everafter-partner-tasks',sharedTasks);renderCollab();});row.append(check,details,remove);list.append(row);});$('#collabCount').textContent=`${sharedTasks.length} task${sharedTasks.length===1?'':'s'}`;const notes=$('#partnerNotes');notes.replaceChildren();sharedNotes.forEach(note=>{const item=document.createElement('div');item.className='partner-note';item.textContent=note.text;const small=document.createElement('small');small.textContent='Saved in this browser';item.append(small);notes.append(item);});}
  $('#collabForm').addEventListener('submit',e=>{e.preventDefault();sharedTasks.push({title:$('#collabTask').value.trim(),owner:$('#collabOwner').value,date:$('#collabDate').value,done:false});writeStore('everafter-partner-tasks',sharedTasks);e.currentTarget.reset();$('#collabFeedback').textContent='Shared task added on this device.';renderCollab();});
  $('#partnerNoteForm').addEventListener('submit',e=>{e.preventDefault();const note=$('#partnerNote').value.trim();if(!note){$('#partnerNoteStatus').textContent='Write a note before saving.';return;}sharedNotes.unshift({text:note});writeStore('everafter-partner-notes',sharedNotes);$('#partnerNote').value='';$('#partnerNoteStatus').textContent='Note saved in this browser.';renderCollab();});renderCollab();

  // Demo contact form — no server submission
  $('#contactForm').addEventListener('submit', event => {
    event.preventDefault();
    const name = new FormData(event.currentTarget).get('name').toString().trim();
    $('#contactFeedback').textContent = `Thank you, ${name || 'there'}! Your message is shown as submitted in this prototype. No email was sent.`;
    event.currentTarget.reset();
  });
})();