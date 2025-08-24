export interface DummyUser {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export function generateDummyUser(): DummyUser {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 10000);

  return {
    email: `portal-ci-test+${timestamp}${randomNum}@lumeweb.com`,
    firstName: `Test${randomNum}`,
    lastName: `User${randomNum}`,
    password: `Password${randomNum}!`,
  };
}
