#!/bin/bash

# Extract states and functions from Home.jsx
STATES=$(cat client/src/pages/Home.jsx | grep -A 7 "const \[commentInputs")
FUNCTIONS=$(cat client/src/pages/Home.jsx | awk '/\/\/ Hàm xử lý Comment/{flag=1} /return \(/{if(flag) {print; flag=0; next}} flag')

# Wait, it's easier to just use node script to update
node -e "
const fs = require('fs');

const homeRaw = fs.readFileSync('client/src/pages/Home.jsx', 'utf8');
const profileRaw = fs.readFileSync('client/src/pages/Profile.jsx', 'utf8');
const userProfileRaw = fs.readFileSync('client/src/pages/UserProfile.jsx', 'utf8');

const commentStates = homeRaw.match(/  const \[commentInputs[\s\S]*?setActiveDropdownCommentId\(null\);/)[0];

const commentFunctions = homeRaw.match(/  \/\/ Hàm xử lý Comment[\s\S]*?const handleDeleteComment \= async \(postId\, commentId\) \=\> \{[\s\S]*?\}\;\n  \};/)[0];

const commentModalAndStyles = homeRaw.match(/      \{\/\* \=\=\=\=\= MODAL BÌNH LUẬN \=\=\=\=\= \*\/\}[\s\S]*?\}\)\}\n        \<\/main\>/);
// Wait, the modal is outside of main but inside div.
const commentModalMatch = homeRaw.match(/      \{\/\* \=\=\=\=\= MODAL BÌNH LUẬN \=\=\=\=\= \*\/\}[\s\S]*?\}\)\n    \<\/div\>/)[0].replace('    </div>', '');

const commentStyles = homeRaw.match(/  commentListSection: \{[\s\S]*?saveCommentBtn: \{[\s\S]*?\},/)[0];

// Insert into Profile.jsx
let newProfile = profileRaw;
newProfile = newProfile.replace(/  const \[isUpdating\, setIsUpdating\] \= useState\(false\);/, '  const [isUpdating, setIsUpdating] = useState(false);\n' + commentStates);
newProfile = newProfile.replace(/  const handleSaveProfile \= async \(\) \=\> \{/, commentFunctions + '\n\n  const handleSaveProfile = async () => {');
newProfile = newProfile.replace(/                      \<button style=\{styles\.actionBtn\}\>/, '                      <button style={styles.actionBtn} onClick={() => openCommentModal(post._id)}>');
// Need to replace the modal right before closing div of Profile.jsx
newProfile = newProfile.replace(/    \<\/div\>\n  \)\;\n\}\;/, commentModalMatch + '    </div>\n  );\n};');
// Need currentUserId
newProfile = newProfile.replace(/  return \(/, '  const currentUserId = profileData?._id;\n\n  return (');
// Insert styles
newProfile = newProfile.replace(/  cancelBtn: \{[\s\S]*?\},/, (match) => match + '\n' + commentStyles);

fs.writeFileSync('client/src/pages/Profile.jsx', newProfile);

// Insert into UserProfile.jsx
let newUserProfile = userProfileRaw;
newUserProfile = newUserProfile.replace(/  const \[likedPosts\, setLikedPosts\] \= useState\(\{\}\);/, '  const [likedPosts, setLikedPosts] = useState({});\n' + commentStates);
newUserProfile = newUserProfile.replace(/  const handleLike \= async \(postId\) \=\> \{/, commentFunctions + '\n\n  const handleLike = async (postId) => {');
newUserProfile = newUserProfile.replace(/                        \<button style=\{styles\.actionBtn\}\>/, '                        <button style={styles.actionBtn} onClick={() => openCommentModal(post._id)}>');
newUserProfile = newUserProfile.replace(/    \<\/div\>\n  \)\;\n\}\;/, commentModalMatch + '    </div>\n  );\n};');
newUserProfile = newUserProfile.replace(/  return \(/, '  const currentUserId = currentUser?._id;\n\n  return (');
newUserProfile = newUserProfile.replace(/  greenBtn: \{[\s\S]*?\},/, (match) => match + '\n' + commentStyles);

fs.writeFileSync('client/src/pages/UserProfile.jsx', newUserProfile);
"
