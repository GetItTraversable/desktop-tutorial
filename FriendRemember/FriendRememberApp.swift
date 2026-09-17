import SwiftUI
import SwiftData

@main
struct FriendRememberApp: App {
    var body: some Scene {
        WindowGroup {
            FriendListView()
        }
        .modelContainer(for: Friend.self)
    }
}
