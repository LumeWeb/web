export default abstract class Metadata {
  abstract toJson(): { [key: string]: any };
}
