import React from "react";

export function Message() {
  return (
    <section
      id="message"
      className="bg-aquamarine py-16 px-6 md:px-20"
    >
      <div className="max-w-4xl mx-auto">
        <p className="text-xl md:text-2xl text-blue-charcoal font-body leading-relaxed">
          Some of the world's largest online threats right now are censorship of
          speech <i>and</i> money. Web3 represents unifying many legos to create a truly
          user-owned web. Decentralization is a means to an end, not the end itself. The
          true goal is that you are in control of your personal web, and no one else.
        </p>
      </div>
    </section>
  );
}

export default Message;