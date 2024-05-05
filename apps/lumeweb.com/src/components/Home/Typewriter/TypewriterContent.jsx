import Typewriter from "typewriter-effect";

const HeaderContent = () => {
  var
    headerStrings = [
      'Access to the web <br /> for the masses',
      'An open web <br /> for business',
      'Web3 for the masses',
      'Web3 for you'
    ],
    randomString = headerStrings[Math.floor(Math.random() * headerStrings.length)],
    words = randomString.split(' ');

  return (
    <Typewriter options={{ cursor: '<span class="text-primary">_</span>' }} onInit={(typewriter) => {
      typewriter
        .changeDelay(50)
        .typeString(randomString.substring(0, randomString.lastIndexOf(' ')) + ' ')
        .start();
      typewriter
        .typeString('<span class="text-primary">' + words[words.length - 1] + '</span>')
    }} />
  );
};

export default HeaderContent;
