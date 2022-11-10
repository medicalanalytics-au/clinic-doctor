Author: Zulkarnain Shariff

# Doctor's portal for clinic usage

## Project Overview

### System Implementation and Structure
There are two front facing interfaces (Doctor's and Patient's portals) developed completely separate, but with similar structure and theme to 
ensure consistency. Both frontend interfaces are written in ReactJs, and hosted on a server running NodeJs, which serves the built static
pages for both apps individually


### History
Project started with a design that is similar to Uber/Ride sharing concept of matching Doctors and Patients online.
A scheduling system, with internal messaging and news updates were added to the capabilities.

However, project backers requested that it is used in their own local clinic.
Scheduling, messaging and news functions were removed (hidden, but implementation codes remains) to accommodate.

### Current implementation
Application now starts with a Dashboard that loads the Doctor's appointments immediately on start. 

Doctor's login is strictly through a verified profile. Adding and removing of doctors, and changing of profile could be done through 
the Administrating Doctor's panel.