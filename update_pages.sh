#!/bin/bash
for file in client/src/pages/*.jsx; do
  if grep -q "const \[pendingCount" "$file"; then
    echo "Updating $file"
    # remove fetchPendingCount() in useEffect
    sed -i '' 's/fetchPendingCount();//g' "$file"
    # remove fetchPendingCount definition block
    sed -i '' '/const fetchPendingCount/,/^  };/d' "$file"
    # replace useState(0) with useSocket()
    sed -i '' 's/const \[pendingCount, setPendingCount\] = useState(0);/const { pendingCount } = useSocket();/g' "$file"
    
    # Check if useSocket is imported, if not add it
    if ! grep -q "useSocket" "$file"; then
      sed -i '' 's/import LeftSidebar/import { useSocket } from "..\/context\/SocketContext";\
import LeftSidebar/' "$file"
    fi
  fi
done
