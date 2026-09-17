import Foundation
import SwiftData

@Model
final class Friend {
    var name: String
    var friendDescription: String
    var locationMet: String
    var dateMet: Date
    var photoData: Data?

    init(
        name: String = "",
        friendDescription: String = "",
        locationMet: String = "",
        dateMet: Date = .now,
        photoData: Data? = nil
    ) {
        self.name = name
        self.friendDescription = friendDescription
        self.locationMet = locationMet
        self.dateMet = dateMet
        self.photoData = photoData
    }
}
