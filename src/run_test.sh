echo "-------------------------------"
echo
python3 tests/test_coordinator.py
echo "-------------------------------"
echo
http DELETE "http://127.0.0.1:7000/q/queue:event"
http --json POST http://127.0.0.1:7000/r/event/ns:event:1 action=trigger
echo "-------------------------------"
echo
http DELETE "http://127.0.0.1:7000/q/queue:event"
python3 tests/test_trigger.py
echo "-------------------------------"
echo
python3 tests/test_trigger.py
