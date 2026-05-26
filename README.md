# GritCommit

GritCommit is my attempt at making a commitment device service. Unfortunately it never got a formal public release as I moved onto other projects, but I'm pretty satisfied with how the e2e flow turned out.

Like other commitment device apps, GritCommit allows users to "commit" to goals and assign an accountability partner that can approve or deny the goal's completion. However what made GritCommit unique was that the accountability partner's interface was completely done through email or sms (up to them). For example, when receiving a scheduled email they would be able to click a button that would approve/deny completion, and in SMS they could reply yes/no. I did this to achieve an 'async' communication feel and make the UX as simple as possible for the partner so they wouldn't need to go through the hassle of making an account and learning how to use a new UI. I felt this was important given that reducing as much friction as possible in the UX would make it more likely for users to actually create a goal, assign a partner, and complete it.

## Setting up cron job
```bash
# open crontab editor
crontab -e

# add this line
0 * * * * /root/programming/gritcommit/web/src/scripts/run-goal-job.sh >> /root/programming/gritcommit/web/webcron.log 2>&1

# verify cron job was added
crontab -l
```

### Scheduling implementation
- due date  
  - cron job runs at 12pm everyday and fetches all goals that are expiring TODAY
    - sends email to user with 2 buttons to verify completion
    - **if user verifys yes**
      - redirect user to site with screen that says "congrats" + partner has been notified, waiting for partner to verify + send them evidence
      - send email to partner with 2 buttons to verify users completion (grace period for partner verification is 12 hours? or maybe no grace period?)
        - **if partner says yes**
          - redirect partner to site with screen that says "nice" + user has been notified
          - send user email with notification that partner said "yes" and "congrats" + they don't have to send money
        - **if partner says no**
          - redirect partner to site with screen that says "too bad" + user has been notified + expect money to be etransfered to you soon
          - send user email with notification that partner said "no" and they have to send them money soon
        - **if partner doesn't verify before grace period ends**
          - send user email saying partner couldn't verify in time so user automatically succeeded
          - send partner email saying they didn't verify in time, so user automatically succeeded. etransfer wont be sent
    - **if user verifys no**
      - redirect user to site with screen that says "oops" and prompt them to send money/etransfer stake amount to partner
      - send email to partner that confirms user failed to complete and will be sending them money
    - **if user doesn't verify before due date**
      - send user email saying they failed and must etransfer
      - send partner email saying user failed and will etransfer
  - reminders
    - if goal is >1 week away, send reminder to user 7 days @ 12pm
    - send reminder to user day before due date @ 12pm
- everyday/custom day
  - 
- x days a week

### Database flow
- user creates goal
- scheduleItem is created based on scheduleType
  - single due date -> create scheduleItem with dueDate
  - everday -> create scheduleItem that starts at earliest day 
    - e.g. today is tuesday, user specified they want to start today so schedule item for tues
    - e.g. today is tues, user specified they want to start tmrw so schedule item for wed
  - custom days -> create scheduleItem that starts at earliest day
    - e.g. today is tues, next custom day is thurs so schedule item for thurs
    - e.g. today is tues, next custom day is tues, so schedule item for today (if user said thats okay!!!)
- follow same cron job flow when scheduleItems are fetched on due dates
  - however, if user completed goal successfully, then we have to create the next schedule item for the goal based on the schedule type. we can follow the flow mentioned earlier for that.
