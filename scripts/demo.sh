echo '#!/bin/bash

set -e

echo "Generating dataset (50,000 apartments, 200,000 appointments)..."
npx ts-node generate-data.ts
if [ $? -ne 0 ]; then
  echo "Error generating data"
  exit 1
fi

echo "Loading data..."
npx ts-node scripts/load-data.ts
if [ $? -ne 0 ]; then
  echo "Error loading data"
  exit 1
fi

echo "Transforming data..."
npx ts-node scripts/transform-data.ts
if [ $? -ne 0 ]; then
  echo "Error transforming data"
  exit 1
fi

echo "Starting server..."
npm run start:dev &
SERVER_PID=$!
sleep 5

if ! ps -p $SERVER_PID > /dev/null; then
  echo "Error: Server failed to start"
  exit 1
fi

echo "Querying top 5 apartments in Davis..."
curl "http://localhost:5005/metrics/bookings?limit=5&city=Davis"
if [ $? -ne 0 ]; then
  echo "Error querying endpoint"
  kill $SERVER_PID
  exit 1
fi

echo -e "\nDemo complete!"
kill $SERVER_PID' > demo.sh
chmod +x demo.sh