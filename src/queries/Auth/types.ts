export type AuthMeResponse = {
    user: {
      id: string;
      firebaseUid?: string | null;
      phone: string;
      fullName: string;
      role: 'buyer' | 'seller' | 'admin';
      avatar?: string | null;
      createdAt?: string;
    };
    firebase: {
      uid: string;
      phoneNumber?: string;
      provider?: string;
    };
  };
  