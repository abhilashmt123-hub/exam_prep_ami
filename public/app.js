const app = document.querySelector('#app');
const esc = value => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

const pictureIcons = {apple:'🍎',banana:'🍌',mango:'🥭',orange:'🍊',carrot:'🥕',tiger:'🐯',lion:'🦁',elephant:'🐘',cat:'🐱',dog:'🐶',frog:'🐸',fish:'🐟',bird:'🐦',parrot:'🦜',cow:'🐄',goat:'🐐',sheep:'🐑',horse:'🐴',rabbit:'🐰',ant:'🐜',bee:'🐝',butterfly:'🦋',spider:'🕷️',snail:'🐌',snake:'🐍',tortoise:'🐢',dolphin:'🐬',whale:'🐳',flower:'🌸',rose:'🌹',lotus:'🪷',sunflower:'🌻',doctor:'🩺',nurse:'👩‍⚕️',teacher:'👩‍🏫',farmer:'👩‍🌾',firefighter:'👨‍🚒',pilot:'👨‍✈️',postman:'📮',police:'👮',train:'🚆',boat:'🚤',aeroplane:'✈️',bicycle:'🚲',car:'🚗',bus:'🚌',eye:'👁️',nose:'👃',ear:'👂',hand:'✋',foot:'🦶',teeth:'🦷',tongue:'👅',square:'🟧',circle:'🔵',triangle:'🔺',rectangle:'▭',star:'⭐',heart:'💗',red:'🔴',blue:'🔵',green:'🟢',yellow:'🟡',purple:'🟣',pink:'🩷',black:'⚫',white:'⚪',raincoat:'🧥',umbrella:'☂️',pencil:'✏️',book:'📚',chair:'🪑',bed:'🛏️',clock:'🕐',gandhi:'👴',nehru:'👨🏻',tricolour:'🇮🇳',india:'🇮🇳'};

const samplePicture = label => { const key=String(label).toLowerCase().split(/\s|’|'/)[0]; const icon=pictureIcons[key]||'🖼️'; return `<div class="missing-image sample-picture" aria-label="Sample picture of ${esc(label)}"><span style="font-size:3rem">${icon}</span><small>${esc(label)}</small></div>`; };

const optionImage = option => {
  if (!option.image) return '';
  return `<img src="${esc(option.image)}" alt="${esc(option.text)}" onerror="this.nextElementSibling.hidden=false;this.remove()"><div hidden>${samplePicture(option.text)}</div>`;
};

const nav = () => `<nav class="topnav"><a class="link-btn" href="#/">🏠 Home</a><a class="link-btn" href="#/history">📚 History</a></nav>`;

async function api(url, options) { const res = await fetch(url, options); if (!res.ok) throw new Error('Something went wrong'); return res.json(); }

async function home(){const tests=await api('/api/tests');const balancedCount=tests.length*5;app.innerHTML=`<section class="panel">${nav()}<div class="celebrate">🌟</div><h1>Talent Exam Practice</h1><p>Choose a balanced test or practise one learning area.</p><button class="test-card" id="start">▶ Balanced Test<span class="small">${balancedCount} questions, five from each learning area</span></button><h2>Choose a learning area</h2><div class="test-grid">${tests.map(test=>`<button class="test-card" data-test-id="${esc(test.id)}">${esc(test.title.replace(/\b\w/g, letter=>letter.toUpperCase()))}<span class="small">${test.questionCount} questions</span></button>`).join('')}</div></section>`;document.querySelector('#start').onclick=()=>startTest().catch(showError);document.querySelectorAll('[data-test-id]').forEach(button=>button.onclick=()=>startTest(button.dataset.testId).catch(showError))}

async function startTest(testId){const test=await api(testId?`/api/tests/${encodeURIComponent(testId)}`:'/api/random-test');test.isBalanced=!testId;await takeTest(test)}

async function takeTest(test) {
  let i = 0;
  const answers = [];
  function draw() {
    const question = test.questions[i];
    app.innerHTML = `<section class="panel">${nav()}<p><b>Question ${i + 1} of ${test.questions.length}</b></p><div class="progress"><div style="width:${(i / test.questions.length) * 100}%"></div></div><h2 class="question">${esc(question.prompt)}</h2><div class="options">${question.options.map((option, index) => `<button class="option" data-choice="${index}" aria-pressed="false">${optionImage(option)}<span>${esc(option.text)}</span></button>`).join('')}</div><p class="answer-feedback" role="status" aria-live="polite"></p><button class="next" disabled>${i === test.questions.length - 1 ? 'Finish! 🎉' : 'Next →'}</button></section>`;
    let chosen = null;
    const optionButtons = [...document.querySelectorAll('[data-choice]')];
    const nextButton = document.querySelector('.next');
    const feedback = document.querySelector('.answer-feedback');
    optionButtons.forEach(button => button.onclick = () => {
      if (chosen !== null) return;
      chosen = Number(button.dataset.choice);
      const correct = chosen === question.correctIndex;
      optionButtons.forEach((optionButton, index) => {
        optionButton.disabled = true;
        optionButton.setAttribute('aria-pressed', String(index === chosen));
        if (index === question.correctIndex) optionButton.classList.add('correct');
        else if (index === chosen) optionButton.classList.add('incorrect');
      });
      feedback.classList.add(correct ? 'correct-feedback' : 'incorrect-feedback');
      feedback.textContent = correct
        ? 'Correct! ✅'
        : `Not quite. The correct answer is ${question.options[question.correctIndex].text}.`;
      nextButton.disabled = false;
    });
    nextButton.onclick = async () => {
      answers.push(chosen);
      if (++i < test.questions.length) draw();
      else await results(test, answers);
    };
  }
  draw();
}

async function results(test, answers) {
  const score = answers.reduce((total, answer, index) => total + (answer === test.questions[index].correctIndex), 0);
  await api('/api/results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testId: test.id, title: test.title, score, total: test.questions.length })
  });
  const message = score === test.questions.length
    ? 'Amazing! Perfect score!'
    : score >= Math.ceil(test.questions.length * 0.7)
      ? 'Great job! You did so well!'
      : 'Nice try! Practice makes you stronger!';
  app.innerHTML = `<section class="panel">${nav()}<div class="celebrate">${score >= 7 ? '🎉' : '⭐'}</div><h1>Your Score: ${score} / ${test.questions.length}</h1><h2>${message}</h2><button class="next" id="retake">Start another test</button><div class="review">${test.questions.map((question, index) => {
    const correct = answers[index] === question.correctIndex;
    return `<article class="review-item ${correct ? '' : 'wrong'}"><b>${index + 1}. ${esc(question.prompt)}</b><br>Your answer: <span class="answer">${esc(question.options[answers[index]].text)}</span> ${correct ? '✅' : '❌'}${correct ? '' : `<br>Correct answer: <span class="answer">${esc(question.options[question.correctIndex].text)}</span>`}</article>`;
  }).join('')}</div></section>`;
  document.querySelector('#retake').onclick = () => startTest(test.isBalanced ? null : test.id).catch(showError);
}

async function history(){const rows=(await api('/api/history')).slice().reverse();app.innerHTML=`<section class="panel">${nav()}<h1>Practice History</h1>${rows.length?`<ul class="history">${rows.map(a=>`<li><b>${esc(a.title||'Practice Test')}</b> — ${a.score}/${a.total}<br><small>${new Date(a.completedAt).toLocaleString()}</small></li>`).join('')}</ul>`:'<p>No attempts yet. Start a test to begin!</p>'}</section>`}

function route(){const p=location.hash.slice(2).split('/');if(p[0]==='history')history().catch(showError);else home().catch(showError)}function showError(){app.innerHTML='<section class="panel"><h1>Oops!</h1><p>Could not load the practice app. Please check the JSON files and try again.</p></section>'}window.addEventListener('hashchange',route);route();