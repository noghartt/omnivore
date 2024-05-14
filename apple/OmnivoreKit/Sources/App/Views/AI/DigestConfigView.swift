import SwiftUI
import Models
import Services
import Views
import MarkdownUI
import Utils
import Transmission

@MainActor
public class DigestConfigViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var alreadyGranted = false

  @Published var isIneligible = false
  @Published var hasOptInError = false
  @Published var digest: DigestResult?
  @Published var chapterInfo: [(DigestChapter, DigestChapterData)]?
  @Published var presentedLibraryItem: String?
  @Published var presentWebContainer = false

  @AppStorage(UserDefaultKey.lastVisitedDigestId.rawValue) var lastVisitedDigestId = ""

  func checkAlreadyOptedIn(dataService: DataService) async {
    isLoading = true
    if let user = try? await dataService.fetchViewer() {
      alreadyGranted = user.hasFeatureGranted("ai-digest")
    }
    isLoading = false
  }

  func enableDigest(dataService: DataService) async {
    isLoading = true
    do {
      if try await dataService.optInFeature(name: "ai-digest") == nil {
        throw BasicError.message(messageText: "Could not opt into feature")
      }
      try await dataService.setupUserDigestConfig()
    } catch {
      if error is IneligibleError {
        isIneligible = true
      } else {
        hasOptInError = true
      }
    }

    isLoading = false
  }
}

@available(iOS 17.0, *)
@MainActor
struct DigestConfigView: View {
  @StateObject var viewModel = DigestConfigViewModel()
  let homeViewModel: HomeFeedViewModel
  let dataService: DataService

  @Environment(\.dismiss) private var dismiss

  public init(dataService: DataService, homeViewModel: HomeFeedViewModel) {
    self.dataService = dataService
    self.homeViewModel = homeViewModel
  }

  var titleBlock: some View {
    HStack {
      Text("Omnivore Digest")
        .font(Font.system(size: 18, weight: .semibold))
      Image.tabDigestSelected
      Spacer()
      closeButton
    }
    .padding(.top, 20)
    .padding(.horizontal, 20)
  }

  var body: some View {
    VStack {
      titleBlock
        .padding(.top, 10)

      if viewModel.isLoading {
        HStack {
          Spacer()
          ProgressView()
          Spacer()
        }
      } else if viewModel.alreadyGranted {
        Text("You've been added to the AI Digest demo. You first issue should be ready soon.")
          .padding(15)
      } else if viewModel.isIneligible {
        Text("To enable digest you need to have saved at least ten library items and have two active subscriptions.")
          .padding(15)
      } else if viewModel.hasOptInError {
        Text("There was an error setting up digest for your account.")
          .padding(15)
      } else {
        itemBody
          .padding(15)
      }

      Spacer()
     }.task {
       await viewModel.checkAlreadyOptedIn(dataService: dataService)
     }
  }

  var closeButton: some View {
    Button(action: {
      dismiss()
    }, label: {
      Text("Close")
        .foregroundColor(Color.blue)
    })
    .buttonStyle(.plain)
  }

  var logoBlock: some View {
    HStack {
      Image.coloredSmallOmnivoreLogo
        .resizable()
        .frame(width: 20, height: 20)
      Text("Omnivore.app")
        .font(Font.system(size: 14))
        .foregroundColor(Color.themeLibraryItemSubtle)
      Spacer()
    }
  }

  @available(iOS 17.0, *)
  var itemBody: some View {
    VStack(alignment: .leading, spacing: 20) {
      logoBlock

      let description1 =
      """
      Omnivore Digest is a free daily digest of your best recent library items. Omnivore
      filters and ranks all the items recently added to your library, uses AI to summarize them,
      and creates a short library item, email, or a daily podcast you can listen to in our iOS app.

      Note that if you sign up for Digest, your recent library items will be processed by an AI
      service (Anthropic, or OpenAI). Your highlights, notes, and labels will not be sent to the AI
      service.

      Digest is available to all users that have saved at least ten items and added two subscriptions.
      """
      Markdown(description1)
        .lineSpacing(10)
        .accentColor(.appGraySolid)
        .font(.appSubheadline)
        .padding(5)
        .frame(maxWidth: .infinity, alignment: .leading)

      HStack {
        Spacer()

        Button(action: {
          homeViewModel.hideDigestIcon = true
          dismiss()
        }, label: { Text("Hide digest") })
          .buttonStyle(RoundedRectButtonStyle())

        Button(action: {
          // viewModel.en
        }, label: { Text("Enable digest") })
          .buttonStyle(RoundedRectButtonStyle(color: Color.blue, textColor: Color.white))
      }
    }
    .padding(15)
    .background(Color.themeLabelBackground.opacity(0.6))
    .cornerRadius(5)
  }
}
