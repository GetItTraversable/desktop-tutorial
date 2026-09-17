import SwiftUI

struct FriendDetailView: View {
    @Bindable var friend: Friend
    @State private var isPresentingEdit = false

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                FriendAvatar(photoData: friend.photoData, size: 160)
                    .padding(.top, 12)

                Text(friend.name.isEmpty ? "Unnamed" : friend.name)
                    .font(.title.bold())

                VStack(alignment: .leading, spacing: 16) {
                    if !friend.locationMet.isEmpty {
                        InfoRow(icon: "mappin.and.ellipse", title: "Met At", value: friend.locationMet)
                    }

                    InfoRow(
                        icon: "calendar",
                        title: "Date Met",
                        value: friend.dateMet.formatted(date: .abbreviated, time: .omitted)
                    )

                    if !friend.friendDescription.isEmpty {
                        VStack(alignment: .leading, spacing: 6) {
                            Label("About", systemImage: "text.alignleft")
                                .font(.headline)
                            Text(friend.friendDescription)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
                .padding(.horizontal)
            }
            .padding(.bottom, 24)
        }
        .navigationTitle(friend.name.isEmpty ? "Friend" : friend.name)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Edit") {
                    isPresentingEdit = true
                }
            }
        }
        .sheet(isPresented: $isPresentingEdit) {
            FriendFormView(friend: friend)
        }
    }
}

private struct InfoRow: View {
    let icon: String
    let title: String
    let value: String

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: icon)
                .foregroundStyle(.tint)
                .frame(width: 20)
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(value)
                    .font(.body)
            }
        }
    }
}

#Preview {
    NavigationStack {
        FriendDetailView(friend: Friend(
            name: "Jordan Lee",
            friendDescription: "Met at the climbing gym, loves hiking and board games.",
            locationMet: "Central Park, NYC",
            dateMet: .now
        ))
    }
}
