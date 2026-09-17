import SwiftUI
import SwiftData
import PhotosUI

struct FriendFormView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @StateObject private var locationManager = LocationManager()

    /// The friend being edited, or nil when creating a new one.
    private var existingFriend: Friend?

    @State private var name: String
    @State private var friendDescription: String
    @State private var locationMet: String
    @State private var dateMet: Date
    @State private var photoData: Data?

    @State private var selectedPhotoItem: PhotosPickerItem?

    init(friend: Friend?) {
        existingFriend = friend
        _name = State(initialValue: friend?.name ?? "")
        _friendDescription = State(initialValue: friend?.friendDescription ?? "")
        _locationMet = State(initialValue: friend?.locationMet ?? "")
        _dateMet = State(initialValue: friend?.dateMet ?? .now)
        _photoData = State(initialValue: friend?.photoData)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    HStack {
                        Spacer()
                        VStack(spacing: 8) {
                            FriendAvatar(photoData: photoData, size: 100)
                            PhotosPicker(selection: $selectedPhotoItem, matching: .images) {
                                Text(photoData == nil ? "Add Photo" : "Change Photo")
                            }
                        }
                        Spacer()
                    }
                }

                Section("About") {
                    TextField("Name", text: $name)
                    TextField("Description", text: $friendDescription, axis: .vertical)
                        .lineLimit(3...6)
                }

                Section("Where You Met") {
                    TextField("Location", text: $locationMet)
                    Button {
                        locationManager.requestCurrentPlace()
                    } label: {
                        if locationManager.isLocating {
                            ProgressView()
                        } else {
                            Label("Use Current Location", systemImage: "location.fill")
                        }
                    }
                    .disabled(locationManager.isLocating)
                    if let errorMessage = locationManager.errorMessage {
                        Text(errorMessage)
                            .font(.footnote)
                            .foregroundStyle(.red)
                    }
                    DatePicker("Date Met", selection: $dateMet, displayedComponents: .date)
                }
            }
            .navigationTitle(existingFriend == nil ? "New Friend" : "Edit Friend")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }
                        .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .onChange(of: selectedPhotoItem) {
                Task {
                    if let data = try? await selectedPhotoItem?.loadTransferable(type: Data.self) {
                        photoData = data
                    }
                }
            }
            .onChange(of: locationManager.placeName) {
                if let placeName = locationManager.placeName {
                    locationMet = placeName
                }
            }
        }
    }

    private func save() {
        if let existingFriend {
            existingFriend.name = name
            existingFriend.friendDescription = friendDescription
            existingFriend.locationMet = locationMet
            existingFriend.dateMet = dateMet
            existingFriend.photoData = photoData
        } else {
            let newFriend = Friend(
                name: name,
                friendDescription: friendDescription,
                locationMet: locationMet,
                dateMet: dateMet,
                photoData: photoData
            )
            modelContext.insert(newFriend)
        }
        dismiss()
    }
}

#Preview {
    FriendFormView(friend: nil)
        .modelContainer(for: Friend.self, inMemory: true)
}
