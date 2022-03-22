import Foundation

public struct ArticleContent {
  public let htmlContent: String
  public let highlights: [Highlight]

  public init(
    htmlContent: String,
    highlights: [Highlight]
  ) {
    self.htmlContent = htmlContent
    self.highlights = highlights

    print(highlightsJSONString)
  }

  public var highlightsJSONString: String {
    let jsonData = try? JSONEncoder().encode(highlights)
    guard let jsonData = jsonData else { return "[]" }
    return String(data: jsonData, encoding: .utf8) ?? "[]"
  }
}
