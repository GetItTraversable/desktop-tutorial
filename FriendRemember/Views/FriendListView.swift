import SwiftUI
import SwiftData
import UIKit

struct FriendListView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Friend.name) private var friends: [Friend]

    @State private var searchText = ""
    @State private var isPresentingNewFriend = false

    private var filteredFriends: [Friend] {
        guard !searchText.isEmpty else { return friends }
        return friends.filter {
            $0.name.localizedCaseInsensitiveContains(searchText) ||
            $0.locationMet.localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        NavigationStack {
            Group {
                if friends.isEmpty {
                    ContentUnavailableView(
                        "No Friends Yet",
                        systemImage: "person.crop.circle.badge.plus",
                        description: Text("Tap + to remember a new friend: their name, photo, and where you met.")
                    )
                } else {
                    List {
                        ForEach(filteredFriends) { friend in
                            NavigationLink(value: friend) {
                                FriendRow(friend: friend)
                            }
                        }
                        .onDelete(perform: deleteFriends)
                    }
                    .searchable(text: $searchText, prompt: "Search by name or place")
                }
            }
            .navigationTitle("Friends")
            .navigationDestination(for: Friend.self) { friend in
                FriendDetailView(friend: friend)
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        isPresentingNewFriend = true
                    } label: {
                        Label("Add Friend", systemImage: "plus")
                    }
                }
            }
            .sheet(isPresented: $isPresentingNewFriend) {
                FriendFormView(friend: nil)
            }
        }
    }

    private func deleteFriends(at offsets: IndexSet) {
        for index in offsets {
            modelContext.delete(filteredFriends[index])
        }
    }
}

private struct FriendRow: View {
    let friend: Friend

    var body: some View {
        HStack(spacing: 12) {
            FriendAvatar(photoData: friend.photoData, size: 48)

            VStack(alignment: .leading, spacing: 2) {
                Text(friend.name.isEmpty ? "Unnamed" : friend.name)
                    .font(.headline)
                if !friend.locationMet.isEmpty {
                    Label(friend.locationMet, systemImage: "mappin.and.ellipse")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

struct FriendAvatar: View {
    let photoData: Data?
    var size: CGFloat = 48

    var body: some View {
        Group {
            if let photoData, let uiImage = UIImage(data: photoData) {
                Image(uiImage: uiImage)
                    .resizable()
                    .scaledToFill()
            } else {
                Image(systemName: "person.crop.circle.fill")
                    .resizable()
                    .scaledToFit()
                    .foregroundStyle(.secondary)
            }
        }
        .frame(width: size, height: size)
        .clipShape(Circle())
    }
}

#Preview {
    FriendListView()
        .modelContainer(for: Friend.self, inMemory: true)
}
