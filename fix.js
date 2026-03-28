const fs = require('fs');

try {
const home = fs.readFileSync('client/src/pages/Home.jsx', 'utf8');

// parse comment states
let statesStart = home.indexOf('const [commentInputs');
let statesEnd = home.indexOf('  // Hàm xử lý Comment');
let states = home.substring(statesStart, statesEnd);

let func1Start = home.indexOf('  // Hàm xử lý Comment');
let func1End = home.indexOf('  const startEditingPost');
let func1 = home.substring(func1Start, func1End);

let func2Start = home.indexOf('  const startEditingComment');
let func2End = home.indexOf('  return (\n');
let func2 = home.substring(func2Start, func2End);

// modal
let modalStart = home.indexOf('{/* ===== MODAL BÌNH LUẬN ===== */}');
let modalEnd = home.lastIndexOf('    </div>');
let modal = home.substring(modalStart, modalEnd)

// styles
let stylesStart = home.indexOf('  commentListSection:');
let stylesEnd = home.indexOf('};\n\nexport default Home;');
let styles = home.substring(stylesStart, stylesEnd);

function applyTo(file, userVar) {
  let content = fs.readFileSync(file, 'utf8');
  
  // insert states before "return ("
  content = content.replace('  return (', 
    states + '\n' + func1 + '\n' + func2 + '\n  const currentUserId = ' + userVar + ';\n\n  return ('
  );

  // replace chat button
  content = content.replace(/<button style=\{styles\.actionBtn\}\>\s*<span className="material-symbols-outlined"\>chat_bubble<\/span>/g, '<button style={styles.actionBtn} onClick={() => openCommentModal(post._id)}>\n                          <span className="material-symbols-outlined">chat_bubble</span>');

  // replace closing div
  content = content.replace(/    \<\/div\>\n  \)\;\n\}\;/g, `\n${modal}    </div>\n  );\n};`);
  
  // replace styles
  content = content.replace(/\};\n\nexport default /g, `\n${styles}};\n\nexport default `);

  fs.writeFileSync(file, content);
  console.log('patched ' + file);
}

applyTo('client/src/pages/Profile.jsx', 'profileData?._id');
applyTo('client/src/pages/UserProfile.jsx', 'currentUser?._id');
console.log('Done');
} catch (e) {
  console.error(e);
}
