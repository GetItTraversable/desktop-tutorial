# Friend Remember

An iPhone app that helps you remember your friends: their name, a photo of
their face, a short description, and where you met them.

## Features

- **Friend list** — searchable by name or location, with photo thumbnails.
- **Add / Edit friend** — capture a name, description, photo (via the Photos
  picker), the date you met, and the location (typed manually or filled in
  automatically from your current location).
- **Friend detail** — a clean profile view with the photo, description, date
  met, and location.
- **Swipe to delete.**
- Data is stored locally on-device with **SwiftData** — no backend required.

## Requirements

- Xcode 15.4 or later
- iOS 17.0+ (simulator or device)

## Getting started

1. Open `FriendRemember.xcodeproj` in Xcode.
2. Select the `FriendRemember` scheme and an iPhone simulator (or your
   device).
3. Press **Run** (⌘R).

The app requests location access only when you tap **Use Current Location**
in the add/edit screen; it's entirely optional — you can always type a
location by hand instead.

## Project structure

```
FriendRemember/
├── FriendRememberApp.swift      # App entry point, sets up the SwiftData container
├── Models/
│   └── Friend.swift             # SwiftData model: name, description, location, date met, photo
├── Views/
│   ├── FriendListView.swift     # Main list + search + add button
│   ├── FriendDetailView.swift   # Friend profile screen
│   └── FriendFormView.swift     # Add/edit form (photo picker + location)
└── Support/
    └── LocationManager.swift    # Wraps CoreLocation + reverse geocoding
```

## Notes

- Photos are stored as `Data` directly on the `Friend` model, which is simple
  and fine for a personal-scale contact list. If you later want to support
  many hundreds of friends with large photos, consider moving photo storage
  to the filesystem and keeping just a file reference in SwiftData.
- All data stays on-device. There's no sync/backend in this version — that
  would be a natural next step (e.g. CloudKit via SwiftData's built-in
  CloudKit support) if you want friends synced across your own devices.
