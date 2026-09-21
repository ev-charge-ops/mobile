export interface paths {
    "/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Register a driver */
        post: operations["register"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Log in with email and password */
        post: operations["login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Rotate the refresh token and issue a new access token */
        post: operations["refresh"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Revoke a refresh token */
        post: operations["logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get the authenticated user */
        get: operations["getMe"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/email-verification/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Confirm the email address with the token sent by email */
        post: operations["confirmEmailVerification"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/email-verification/resend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Send a new verification email to the authenticated user */
        post: operations["resendEmailVerification"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/password/forgot": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Send a password reset link if the email is registered */
        post: operations["forgotPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/password/reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Set a new password with the token sent by email */
        post: operations["resetPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/email-login/request": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Send a login code and magic link if the email is registered */
        post: operations["requestEmailLogin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/email-login/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Log in with the emailed code or magic link token
         * @description Send either { email, code } or { token }. Five wrong codes lock the current code and link.
         */
        post: operations["verifyEmailLogin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/oauth/google": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Log in or sign up with a Google ID token
         * @description Links the Google account to an existing user with the same email or creates a driver account.
         */
        post: operations["loginWithGoogle"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/oauth/google/code": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Log in or sign up with a Google OAuth authorization code
         * @description Exchanges an authorization code obtained through the Google popup flow (redirect URI "postmessage") for an ID token, then behaves like loginWithGoogle.
         */
        post: operations["loginWithGoogleCode"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/oauth/apple": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Log in or sign up with a Sign in with Apple identity token
         * @description Links the Apple ID to an existing user with the same email or creates a driver account. Private relay emails are accepted.
         */
        post: operations["loginWithApple"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/organizations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List the organizations of the authenticated user */
        get: operations["listMyOrganizations"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/organizations/{organizationId}/members": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List the members of an organization (managers only) */
        get: operations["listOrganizationMembers"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/organizations/{organizationId}/invites": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List pending, expired and accepted invites */
        get: operations["listInvites"];
        put?: never;
        /** Invite someone by email to join the organization as a driver */
        post: operations["createInvite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/organizations/{organizationId}/invites/{inviteId}/resend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Issue a new link, extend the expiry and send the invite again */
        post: operations["resendInvite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/organizations/{organizationId}/invites/{inviteId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Revoke an invite */
        delete: operations["revokeInvite"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/invites/{token}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Show the organization and email of an invite */
        get: operations["getInvitePreview"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/invites/{token}/accept": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create an account with the invited email and join the organization */
        post: operations["acceptInvite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/invites/{token}/accept-authenticated": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Join the organization with the authenticated account */
        post: operations["acceptInviteAsCurrentUser"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/charge-points": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List the charge points of the organizations of the user and the public commercial ones, with the current price */
        get: operations["listChargePoints"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/charge-points/{chargePointId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a charge point visible to the user */
        get: operations["getChargePoint"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/organizations/{organizationId}/tariff": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get the tariff currently in force for the organization */
        get: operations["getOrganizationTariff"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Change the tariff of the organization (managers only). Creates a new version valid from now; running sessions keep their locked price */
        patch: operations["updateOrganizationTariff"];
        trace?: never;
    };
    "/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List the sessions of the user, newest first */
        get: operations["listMySessions"];
        put?: never;
        /** Start a session at a point, locking the price per kWh and the demand factor. Private points start charging right away; commercial points hold the estimated maximum on the card first (AWAITING_PAYMENT with the PaymentSheet parameters) and start charging once the hold is authorized */
        post: operations["startSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessions/active": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get the open session of the user (charging, grace or idle), advanced up to now */
        get: operations["getActiveSession"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessions/{sessionId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a session of the user, advancing its telemetry, state and fees up to now */
        get: operations["getSession"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessions/{sessionId}/stop": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** End the session: stops charging early with the partial energy, or unplugs during grace/idle freezing the idle fee. Card payments are captured with the final amount, or released when nothing is due or the session is canceled before charging */
        post: operations["stopSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessions/{sessionId}/payment/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Check the card hold with Stripe after the PaymentSheet completes: an authorized hold starts charging, a canceled one interrupts the session. Idempotent and safe to call again (the Stripe webhook does the same) */
        post: operations["confirmSessionPayment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessions/{sessionId}/payment/sheet": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Issue fresh PaymentSheet parameters (new ephemeral key) for a session still AWAITING_PAYMENT, e.g. after the app was reopened */
        post: operations["createSessionPaymentSheet"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/payments/stripe/webhook": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Stripe webhook (payment_intent.amount_capturable_updated, canceled, payment_failed, succeeded). Verifies the signature over the raw body and reconciles the session with the PaymentIntent; duplicates are ignored */
        post: operations["handleStripeWebhook"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/organizations/{organizationId}/statements/export.csv": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Export the monthly statement for the bill importer: unidade;kwh;energia;acesso;ocupacao;total, decimal comma, UTF-8 with BOM */
        get: operations["exportMonthlyStatementCsv"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/organizations/{organizationId}/statements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Monthly cost-sharing statement per unit: energy at cost, access fee and idle fees (private regime only) */
        get: operations["getMonthlyStatement"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/organizations/{organizationId}/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List the sessions of the organization (managers only), filtered by month, unit and status */
        get: operations["listOrganizationSessions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/organizations/{organizationId}/overview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Monthly indicators of the organization (managers only): energy, sessions, cost-sharing total and electrical capacity */
        get: operations["getOrganizationOverview"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        RegisterDto: {
            /** @example Ana Souza */
            name: string;
            /**
             * Format: email
             * @example ana@example.com
             */
            email: string;
            /** @example s3cure-passw0rd */
            password: string;
        };
        /** @enum {string} */
        Role: "DRIVER" | "MANAGER";
        UserResponseDto: {
            /** Format: uuid */
            id: string;
            /** @example Ana Souza */
            name: string;
            /**
             * Format: email
             * @example ana@example.com
             */
            email: string;
            role: components["schemas"]["Role"];
            /** @description Whether the user confirmed their email */
            emailVerified: boolean;
        };
        AuthResponseDto: {
            user: components["schemas"]["UserResponseDto"];
            /** @description JWT access token (Bearer) */
            accessToken: string;
            /** @description Opaque refresh token, rotated on each use */
            refreshToken: string;
        };
        LoginDto: {
            /**
             * Format: email
             * @example ana@example.com
             */
            email: string;
            /** @example s3cure-passw0rd */
            password: string;
        };
        RefreshTokenDto: {
            /** @description Opaque refresh token issued at login */
            refreshToken: string;
        };
        ConfirmEmailVerificationDto: {
            /** @description Token received in the verification link */
            token: string;
        };
        ForgotPasswordDto: {
            /**
             * Format: email
             * @example ana@example.com
             */
            email: string;
        };
        ResetPasswordDto: {
            /** @description Token received in the password reset link */
            token: string;
            /** @example n3w-s3cure-passw0rd */
            password: string;
        };
        RequestEmailLoginDto: {
            /**
             * Format: email
             * @example ana@example.com
             */
            email: string;
        };
        VerifyEmailLoginDto: {
            /**
             * Format: email
             * @description Required with code; must be omitted when token is sent
             * @example ana@example.com
             */
            email?: string;
            /**
             * @description Six digit code sent by email; required with email
             * @example 042817
             */
            code?: string;
            /** @description Token from the magic link; must be sent alone, without email and code */
            token?: string;
        };
        GoogleLoginDto: {
            /** @description ID token returned by Google Sign-In */
            idToken: string;
        };
        GoogleCodeLoginDto: {
            /** @description Authorization code returned by the Google OAuth popup (redirect URI "postmessage") */
            code: string;
        };
        AppleFullNameDto: {
            /** @example Ana */
            givenName?: string;
            /** @example Souza */
            familyName?: string;
        };
        AppleLoginDto: {
            /** @description Identity token returned by Sign in with Apple */
            identityToken: string;
            /** @description Name shared by Apple on the first authorization only */
            fullName?: components["schemas"]["AppleFullNameDto"];
        };
        /** @enum {string} */
        OrganizationType: "PRIVATE" | "COMMERCIAL";
        /**
         * @description Role of the authenticated user in the organization
         * @enum {string}
         */
        MembershipRole: "MANAGER" | "DRIVER";
        MyOrganizationDto: {
            /** Format: uuid */
            id: string;
            /** @example Residencial Aclimação */
            name: string;
            type: components["schemas"]["OrganizationType"];
            /** @description Role of the authenticated user in the organization */
            role: components["schemas"]["MembershipRole"];
            /** @example B · 42 */
            unitLabel: string | null;
        };
        OrganizationMemberDto: {
            /** Format: uuid */
            userId: string;
            /** @example Ana Souza */
            name: string;
            /**
             * Format: email
             * @example ana@example.com
             */
            email: string;
            role: components["schemas"]["MembershipRole"];
            /** @example B · 42 */
            unitLabel: string | null;
            /** Format: date-time */
            joinedAt: string;
        };
        CreateInviteDto: {
            /**
             * Format: email
             * @example ana@example.com
             */
            email: string;
            /** @example B · 42 */
            unitLabel?: string;
        };
        /** @enum {string} */
        InviteStatus: "PENDING" | "EXPIRED" | "ACCEPTED" | "REVOKED";
        InviteResponseDto: {
            /** Format: uuid */
            id: string;
            /**
             * Format: email
             * @example ana@example.com
             */
            email: string;
            /** @example B · 42 */
            unitLabel: string | null;
            role: components["schemas"]["MembershipRole"];
            status: components["schemas"]["InviteStatus"];
            /** Format: date-time */
            expiresAt: string;
            /** Format: date-time */
            acceptedAt: string | null;
            /** Format: date-time */
            createdAt: string;
        };
        InvitePreviewDto: {
            /** @example Residencial Aclimação */
            organizationName: string;
            /**
             * Format: email
             * @example ana@example.com
             */
            email: string;
            /** @example B · 42 */
            unitLabel: string | null;
            /** Format: date-time */
            expiresAt: string;
            status: components["schemas"]["InviteStatus"];
        };
        AcceptInviteDto: {
            /** @example Ana Souza */
            name: string;
            /** @example s3cure-passw0rd */
            password: string;
        };
        /** @enum {string} */
        ChargePointType: "PRIVATE" | "COMMERCIAL";
        /** @enum {string} */
        ChargePointStatus: "AVAILABLE" | "CHARGING" | "IDLE" | "OFFLINE";
        /** @enum {string} */
        ConnectorType: "TYPE_2" | "CCS_2";
        ChargerResponseDto: {
            /** Format: uuid */
            id: string;
            /** @example GoodWe HCA G2 */
            vendor: string;
            /** @example GW-HCA-G2-0001 */
            serialNumber: string;
            connector: components["schemas"]["ConnectorType"];
        };
        /** @enum {string} */
        DemandLevel: "OFF_PEAK" | "NORMAL" | "PEAK";
        /** @enum {string} */
        DemandFactorSource: "RULE" | "MODEL";
        ChargePointPricingDto: {
            /**
             * @description Price per kWh in cents if a session started now. Private points pass the utility rate through; commercial points apply the demand factor to the base rate
             * @example 89
             */
            pricePerKwhCents: number;
            /** @example 89 */
            utilityRateCents: number;
            /** @example 189 */
            baseRateCents: number | null;
            /**
             * @description Current demand multiplier
             * @example 1
             */
            demandFactor: number;
            demandLevel: components["schemas"]["DemandLevel"];
            demandFactorSource: components["schemas"]["DemandFactorSource"];
            /** @example null */
            demandModelVersion: string | null;
            /** @description False on private points, where the factor is informational only (no margin on energy) */
            demandFactorApplied: boolean;
            /** @example 25 */
            idleFeeCentsPerMinute: number;
            /** @example 3000 */
            idleFeeCapCents: number;
            /** @example 10 */
            gracePeriodMinutes: number;
        };
        ChargePointResponseDto: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            organizationId: string;
            /** @example Residencial Aclimação */
            organizationName: string;
            /** @example L1-01 */
            code: string;
            /** @example Garagem L1 · Vaga 12 */
            name: string;
            type: components["schemas"]["ChargePointType"];
            /** @example -23.56905 */
            latitude: number;
            /** @example -46.63145 */
            longitude: number;
            /** @example 7 */
            maxPowerKw: number;
            status: components["schemas"]["ChargePointStatus"];
            /** @description Whether the user belongs to the organization of the point */
            isMember: boolean;
            charger: components["schemas"]["ChargerResponseDto"] | null;
            /** @description Null when no tariff is configured */
            pricing: components["schemas"]["ChargePointPricingDto"] | null;
        };
        TariffResponseDto: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            organizationId: string;
            /**
             * @description Utility energy rate per kWh in cents, passed through
             * @example 89
             */
            utilityRateCents: number;
            /**
             * @description Base rate per kWh in cents on commercial points
             * @example 189
             */
            baseRateCents: number | null;
            /**
             * @description Monthly access fee per unit with a vehicle, in cents
             * @example 3500
             */
            accessFeeCents: number;
            /** @example 25 */
            idleFeeCentsPerMinute: number;
            /** @example 3000 */
            idleFeeCapCents: number;
            /** @example 10 */
            gracePeriodMinutes: number;
            /** Format: date-time */
            validFrom: string;
        };
        UpdateTariffDto: {
            /** @example 89 */
            utilityRateCents?: number;
            /** @example 189 */
            baseRateCents?: number | null;
            /** @example 3500 */
            accessFeeCents?: number;
            /** @example 25 */
            idleFeeCentsPerMinute?: number;
            /** @example 3000 */
            idleFeeCapCents?: number;
            /** @example 10 */
            gracePeriodMinutes?: number;
        };
        /** @enum {string} */
        ChargingLimitType: "ENERGY" | "AMOUNT" | "FULL";
        ChargingLimitRequestDto: {
            type: components["schemas"]["ChargingLimitType"];
            /**
             * @description Required for ENERGY (kWh, up to 3 decimals) and AMOUNT (integer cents)
             * @example 10
             */
            value?: number;
        };
        StartSessionRequestDto: {
            /** Format: uuid */
            chargePointId: string;
            /** @description Defaults to FULL */
            limit?: components["schemas"]["ChargingLimitRequestDto"];
        };
        /**
         * @description AWAITING_PAYMENT until the card hold is authorized (commercial points only), PENDING while the charger starts, ACTIVE while charging, GRACE after the battery is full (no fee), IDLE once the grace period ends (idle fee per minute up to the cap), CLOSED when ended by the driver, INTERRUPTED when it never charged (payment canceled or expired, charger failure)
         * @enum {string}
         */
        ChargingSessionStatus: "AWAITING_PAYMENT" | "PENDING" | "ACTIVE" | "GRACE" | "IDLE" | "CLOSED" | "INTERRUPTED";
        SessionChargePointDto: {
            /** Format: uuid */
            id: string;
            /** @example L1-01 */
            code: string;
            /** @example Garagem L1 · Vaga 12 */
            name: string;
        };
        SessionLimitDto: {
            type: components["schemas"]["ChargingLimitType"];
            /** @example 10 */
            energyKwh: number | null;
            /** @example 2000 */
            amountCents: number | null;
        };
        /**
         * @description PENDING_AUTHORIZATION until the card is confirmed, AUTHORIZED while the hold is active, CAPTURED with the final amount, CANCELED when the hold is released, FAILED when the card was declined (the driver may retry)
         * @enum {string}
         */
        PaymentStatus: "PENDING_AUTHORIZATION" | "AUTHORIZED" | "CAPTURED" | "CANCELED" | "FAILED";
        SessionPaymentDto: {
            /** @example pi_3Q0abc123 */
            paymentIntentId: string;
            /** @description PENDING_AUTHORIZATION until the card is confirmed, AUTHORIZED while the hold is active, CAPTURED with the final amount, CANCELED when the hold is released, FAILED when the card was declined (the driver may retry) */
            status: components["schemas"]["PaymentStatus"];
            /** @example BRL */
            currency: string;
            /**
             * @description Amount held on the card (pre-authorization)
             * @example 20040
             */
            authorizedCents: number;
            /**
             * @description Final amount charged, set once captured
             * @example 1041
             */
            capturedCents: number | null;
            /**
             * @description Decline code of the last failed attempt
             * @example card_declined
             */
            failureCode: string | null;
            /** Format: date-time */
            authorizedAt: string | null;
            /** Format: date-time */
            capturedAt: string | null;
            /** Format: date-time */
            canceledAt: string | null;
        };
        PaymentSheetDto: {
            /**
             * @description initPaymentSheet paymentIntentClientSecret
             * @example pi_3Q0abc123_secret_xyz
             */
            paymentIntentClientSecret: string;
            /**
             * @description initPaymentSheet customerId
             * @example cus_Q0abc123
             */
            customerId: string;
            /**
             * @description initPaymentSheet customerEphemeralKeySecret
             * @example ek_test_abc123
             */
            customerEphemeralKeySecret: string;
            /**
             * @description Stripe publishable key for initStripe, or null to use the key bundled with the app
             * @example pk_test_abc123
             */
            publishableKey: string | null;
            /** @example EV ChargeOps */
            merchantDisplayName: string;
        };
        StartSessionResponseDto: {
            /** Format: uuid */
            id: string;
            /** @description AWAITING_PAYMENT until the card hold is authorized (commercial points only), PENDING while the charger starts, ACTIVE while charging, GRACE after the battery is full (no fee), IDLE once the grace period ends (idle fee per minute up to the cap), CLOSED when ended by the driver, INTERRUPTED when it never charged (payment canceled or expired, charger failure) */
            status: components["schemas"]["ChargingSessionStatus"];
            chargePoint: components["schemas"]["SessionChargePointDto"];
            /** Format: uuid */
            organizationId: string;
            /** @example B · 42 */
            unitLabel: string | null;
            regime: components["schemas"]["ChargePointType"];
            limit: components["schemas"]["SessionLimitDto"];
            /** @example 29 */
            targetEnergyKwh: number | null;
            /** Format: date-time */
            startedAt: string;
            /** Format: date-time */
            chargingEndedAt: string | null;
            /** Format: date-time */
            graceEndsAt: string | null;
            /** Format: date-time */
            endedAt: string | null;
            /** @example 11.76 */
            energyKwh: number;
            /** @example 7 */
            powerKw: number;
            /** @example 7 */
            allocatedPowerKw: number;
            /** @example 66 */
            socPercent: number | null;
            /**
             * @description Price per kWh locked at start
             * @example 89
             */
            lockedRateCents: number;
            /** @example 1 */
            demandFactor: number;
            demandFactorSource: components["schemas"]["DemandFactorSource"];
            /** @description Version of the ML model that produced the demand factor */
            demandModelVersion: string | null;
            /** @example 1047 */
            energyCostCents: number;
            /** @example 10 */
            gracePeriodMinutes: number;
            /** @example 25 */
            idleFeeCentsPerMinute: number;
            /** @example 3000 */
            idleFeeCapCents: number;
            /** @example 0 */
            idleMinutes: number;
            /** @example 0 */
            idleFeeCents: number;
            /** @example 1047 */
            totalCents: number;
            /** @description Anomaly score from the ML service, set when the session closes */
            anomalyScore: number | null;
            isAnomaly: boolean | null;
            /**
             * @description Simulated seconds per real second for this session (1 with real chargers)
             * @example 60
             */
            simulationSpeed: number;
            /** @description Card payment of commercial sessions (Stripe), null for private sessions billed through the monthly cost sharing */
            payment: components["schemas"]["SessionPaymentDto"] | null;
            /** @description Parameters for the Stripe PaymentSheet when the session is AWAITING_PAYMENT (commercial points), null otherwise */
            paymentSheet: components["schemas"]["PaymentSheetDto"] | null;
        };
        SessionResponseDto: {
            /** Format: uuid */
            id: string;
            /** @description AWAITING_PAYMENT until the card hold is authorized (commercial points only), PENDING while the charger starts, ACTIVE while charging, GRACE after the battery is full (no fee), IDLE once the grace period ends (idle fee per minute up to the cap), CLOSED when ended by the driver, INTERRUPTED when it never charged (payment canceled or expired, charger failure) */
            status: components["schemas"]["ChargingSessionStatus"];
            chargePoint: components["schemas"]["SessionChargePointDto"];
            /** Format: uuid */
            organizationId: string;
            /** @example B · 42 */
            unitLabel: string | null;
            regime: components["schemas"]["ChargePointType"];
            limit: components["schemas"]["SessionLimitDto"];
            /** @example 29 */
            targetEnergyKwh: number | null;
            /** Format: date-time */
            startedAt: string;
            /** Format: date-time */
            chargingEndedAt: string | null;
            /** Format: date-time */
            graceEndsAt: string | null;
            /** Format: date-time */
            endedAt: string | null;
            /** @example 11.76 */
            energyKwh: number;
            /** @example 7 */
            powerKw: number;
            /** @example 7 */
            allocatedPowerKw: number;
            /** @example 66 */
            socPercent: number | null;
            /**
             * @description Price per kWh locked at start
             * @example 89
             */
            lockedRateCents: number;
            /** @example 1 */
            demandFactor: number;
            demandFactorSource: components["schemas"]["DemandFactorSource"];
            /** @description Version of the ML model that produced the demand factor */
            demandModelVersion: string | null;
            /** @example 1047 */
            energyCostCents: number;
            /** @example 10 */
            gracePeriodMinutes: number;
            /** @example 25 */
            idleFeeCentsPerMinute: number;
            /** @example 3000 */
            idleFeeCapCents: number;
            /** @example 0 */
            idleMinutes: number;
            /** @example 0 */
            idleFeeCents: number;
            /** @example 1047 */
            totalCents: number;
            /** @description Anomaly score from the ML service, set when the session closes */
            anomalyScore: number | null;
            isAnomaly: boolean | null;
            /**
             * @description Simulated seconds per real second for this session (1 with real chargers)
             * @example 60
             */
            simulationSpeed: number;
            /** @description Card payment of commercial sessions (Stripe), null for private sessions billed through the monthly cost sharing */
            payment: components["schemas"]["SessionPaymentDto"] | null;
        };
        ActiveSessionResponseDto: {
            /** @description The open session of the user, or null */
            session: components["schemas"]["SessionResponseDto"] | null;
        };
        SessionPageResponseDto: {
            items: components["schemas"]["SessionResponseDto"][];
            /** @example 42 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 20 */
            pageSize: number;
        };
        MeterReadingDto: {
            /** Format: date-time */
            at: string;
            /** @example 5.833 */
            energyKwh: number;
            /** @example 7 */
            powerKw: number;
            /** @example 54 */
            socPercent: number | null;
        };
        SessionDetailResponseDto: {
            /** Format: uuid */
            id: string;
            /** @description AWAITING_PAYMENT until the card hold is authorized (commercial points only), PENDING while the charger starts, ACTIVE while charging, GRACE after the battery is full (no fee), IDLE once the grace period ends (idle fee per minute up to the cap), CLOSED when ended by the driver, INTERRUPTED when it never charged (payment canceled or expired, charger failure) */
            status: components["schemas"]["ChargingSessionStatus"];
            chargePoint: components["schemas"]["SessionChargePointDto"];
            /** Format: uuid */
            organizationId: string;
            /** @example B · 42 */
            unitLabel: string | null;
            regime: components["schemas"]["ChargePointType"];
            limit: components["schemas"]["SessionLimitDto"];
            /** @example 29 */
            targetEnergyKwh: number | null;
            /** Format: date-time */
            startedAt: string;
            /** Format: date-time */
            chargingEndedAt: string | null;
            /** Format: date-time */
            graceEndsAt: string | null;
            /** Format: date-time */
            endedAt: string | null;
            /** @example 11.76 */
            energyKwh: number;
            /** @example 7 */
            powerKw: number;
            /** @example 7 */
            allocatedPowerKw: number;
            /** @example 66 */
            socPercent: number | null;
            /**
             * @description Price per kWh locked at start
             * @example 89
             */
            lockedRateCents: number;
            /** @example 1 */
            demandFactor: number;
            demandFactorSource: components["schemas"]["DemandFactorSource"];
            /** @description Version of the ML model that produced the demand factor */
            demandModelVersion: string | null;
            /** @example 1047 */
            energyCostCents: number;
            /** @example 10 */
            gracePeriodMinutes: number;
            /** @example 25 */
            idleFeeCentsPerMinute: number;
            /** @example 3000 */
            idleFeeCapCents: number;
            /** @example 0 */
            idleMinutes: number;
            /** @example 0 */
            idleFeeCents: number;
            /** @example 1047 */
            totalCents: number;
            /** @description Anomaly score from the ML service, set when the session closes */
            anomalyScore: number | null;
            isAnomaly: boolean | null;
            /**
             * @description Simulated seconds per real second for this session (1 with real chargers)
             * @example 60
             */
            simulationSpeed: number;
            /** @description Card payment of commercial sessions (Stripe), null for private sessions billed through the monthly cost sharing */
            payment: components["schemas"]["SessionPaymentDto"] | null;
            /** @description Meter readings recorded so far, oldest first */
            readings: components["schemas"]["MeterReadingDto"][];
        };
        WebhookReceiptDto: {
            /** @example true */
            received: boolean;
            /**
             * @description False when the event type is ignored or was already processed
             * @example true
             */
            processed: boolean;
        };
        StatementLineDto: {
            /** @example 2 */
            sessionsCount: number;
            /** @example 15.81 */
            energyKwh: number;
            /**
             * @description Energy at the locked rates
             * @example 1407
             */
            energyCents: number;
            /** @example 3500 */
            accessFeeCents: number;
            /** @example 150 */
            idleFeeCents: number;
            /** @example 5057 */
            totalCents: number;
            /**
             * @description Null for sessions of members without a unit
             * @example B · 42
             */
            unitLabel: string | null;
        };
        StatementTotalsDto: {
            /** @example 2 */
            sessionsCount: number;
            /** @example 15.81 */
            energyKwh: number;
            /**
             * @description Energy at the locked rates
             * @example 1407
             */
            energyCents: number;
            /** @example 3500 */
            accessFeeCents: number;
            /** @example 150 */
            idleFeeCents: number;
            /** @example 5057 */
            totalCents: number;
            /** @example 27 */
            unitsCount: number;
        };
        MonthlyStatementResponseDto: {
            /** @example 2026-08 */
            month: string;
            /** Format: date-time */
            periodStart: string;
            /** Format: date-time */
            periodEnd: string;
            /**
             * @description Monthly access fee charged to each unit with a vehicle
             * @example 3500
             */
            accessFeeCents: number;
            lines: components["schemas"]["StatementLineDto"][];
            totals: components["schemas"]["StatementTotalsDto"];
        };
        OrganizationSessionPointDto: {
            /** Format: uuid */
            id: string;
            /** @example L1-01 */
            code: string;
            /** @example Garagem L1 · Vaga 12 */
            name: string;
        };
        OrganizationSessionDriverDto: {
            /** Format: uuid */
            id: string;
            /** @example Ana Ribeiro */
            name: string;
        };
        OrganizationSessionDto: {
            /** Format: uuid */
            id: string;
            status: components["schemas"]["ChargingSessionStatus"];
            regime: components["schemas"]["ChargePointType"];
            chargePoint: components["schemas"]["OrganizationSessionPointDto"];
            driver: components["schemas"]["OrganizationSessionDriverDto"];
            /** @example B · 42 */
            unitLabel: string | null;
            /** Format: date-time */
            startedAt: string;
            /** Format: date-time */
            chargingEndedAt: string | null;
            /** Format: date-time */
            endedAt: string | null;
            /** @example 11.76 */
            energyKwh: number;
            /** @example 89 */
            lockedRateCents: number;
            /** @example 1 */
            demandFactor: number;
            /** @example 1047 */
            energyCostCents: number;
            /** @example 0 */
            idleMinutes: number;
            /** @example 0 */
            idleFeeCents: number;
            /** @example 1047 */
            totalCents: number;
            /** @description Anomaly score from the ML service, when available */
            anomalyScore: number | null;
            isAnomaly: boolean | null;
        };
        OrganizationSessionPageDto: {
            items: components["schemas"]["OrganizationSessionDto"][];
            /** @example 120 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 20 */
            pageSize: number;
        };
        SiteCapacityDto: {
            /** @example 75 */
            contractedDemandKw: number;
            /** @example 11.5 */
            commonAreaReserveKw: number;
            /**
             * @description Power of the sessions charging now
             * @example 14
             */
            chargingDemandKw: number;
            /**
             * @description Common area reserve plus the sessions charging now
             * @example 25.5
             */
            currentDemandKw: number;
            /**
             * @description Current demand over contracted
             * @example 34
             */
            utilizationPercent: number;
            /**
             * @description Average over the days with sessions of the daily peak (reserve plus overlapping sessions)
             * @example 40.2
             */
            averagePeakDemandKw: number;
            /** @example 53.6 */
            averagePeakUtilizationPercent: number;
            /** @description True when the average daily peak is above 80% of the contracted demand */
            upgradeRecommended: boolean;
        };
        WeeklyEnergyDto: {
            /**
             * @description Week of the month (days 1-7 = 1)
             * @example 1
             */
            week: number;
            /** @example 218.4 */
            energyKwh: number;
        };
        OrganizationOverviewResponseDto: {
            /** @example 2026-08 */
            month: string;
            /** @example 1284.6 */
            energyKwh: number;
            /** @example 102 */
            sessionsCount: number;
            /**
             * @description Sessions open now (charging, grace or idle)
             * @example 1
             */
            activeSessionsCount: number;
            /**
             * @description Total of the monthly statement
             * @example 198734
             */
            costSharingTotalCents: number;
            /**
             * @description Card revenue of the commercial points this month
             * @example 45210
             */
            commercialRevenueCents: number;
            /** @example 21 */
            unitsWithVehicle: number;
            /** @example 18 */
            unitsWithConsumption: number;
            capacity: components["schemas"]["SiteCapacityDto"];
            energyByWeek: components["schemas"]["WeeklyEnergyDto"][];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    register: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegisterDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponseDto"];
                };
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Email already registered */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponseDto"];
                };
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid credentials */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    refresh: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshTokenDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponseDto"];
                };
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid, expired or revoked token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshTokenDto"];
            };
        };
        responses: {
            /** @description Refresh token revoked */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getMe: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    confirmEmailVerification: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfirmEmailVerificationDto"];
            };
        };
        responses: {
            /** @description Email verified */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid, expired or used token */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    resendEmailVerification: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Verification email sent unless the email is already verified */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    forgotPassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ForgotPasswordDto"];
            };
        };
        responses: {
            /** @description Always accepted, whether or not the email is registered */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    resetPassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResetPasswordDto"];
            };
        };
        responses: {
            /** @description Password updated and every session revoked */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid payload or invalid, expired or used token */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    requestEmailLogin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RequestEmailLoginDto"];
            };
        };
        responses: {
            /** @description Always accepted, whether or not the email is registered */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    verifyEmailLogin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerifyEmailLoginDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponseDto"];
                };
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid, expired or locked code */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    loginWithGoogle: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GoogleLoginDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponseDto"];
                };
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid token or email not verified by Google */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    loginWithGoogleCode: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GoogleCodeLoginDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponseDto"];
                };
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid or expired code, invalid ID token or email not verified by Google */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Google authorization code flow is not configured (GOOGLE_CODE_FLOW_NOT_CONFIGURED) */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    loginWithApple: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AppleLoginDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponseDto"];
                };
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid token or email not verified by Apple */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listMyOrganizations: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MyOrganizationDto"][];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listOrganizationMembers: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrganizationMemberDto"][];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Organization not found or user is not a member */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listInvites: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InviteResponseDto"][];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Organization not found or user is not a member */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    createInvite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateInviteDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InviteResponseDto"];
                };
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Organization not found or user is not a member */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Email already belongs to a member (ALREADY_MEMBER) or has a pending invite (INVITE_ALREADY_PENDING) */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    resendInvite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: string;
                inviteId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InviteResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Organization not found or user is not a member */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invite already accepted or revoked, or the email is already a member or has another pending invite */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    revokeInvite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: string;
                inviteId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Invite revoked */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Organization not found or user is not a member */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invite already accepted */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getInvitePreview: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InvitePreviewDto"];
                };
            };
            /** @description Unknown invite token (INVITE_NOT_FOUND) */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    acceptInvite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AcceptInviteDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponseDto"];
                };
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unknown invite token (INVITE_NOT_FOUND) */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Email already registered (EMAIL_ALREADY_REGISTERED): log in and use accept-authenticated */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invite expired (INVITE_EXPIRED), revoked (INVITE_REVOKED) or already accepted (INVITE_ALREADY_ACCEPTED) */
            410: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    acceptInviteAsCurrentUser: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Membership created */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invite sent to another email (INVITE_EMAIL_MISMATCH) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unknown invite token (INVITE_NOT_FOUND) */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Already a member (ALREADY_MEMBER) */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invite expired (INVITE_EXPIRED), revoked (INVITE_REVOKED) or already accepted (INVITE_ALREADY_ACCEPTED) */
            410: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listChargePoints: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChargePointResponseDto"][];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getChargePoint: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                chargePointId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChargePointResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Charge point not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getOrganizationTariff: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TariffResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /**
             * @description Tariff not configured
             *
             *     Organization not found or user is not a member
             */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    updateOrganizationTariff: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateTariffDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TariffResponseDto"];
                };
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Organization not found or user is not a member */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listMySessions: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionPageResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    startSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StartSessionRequestDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StartSessionResponseDto"];
                };
            };
            /** @description Invalid payload or limit */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Charge point not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description CHARGE_POINT_BUSY, ACTIVE_SESSION_EXISTS, CHARGE_POINT_OFFLINE, TARIFF_NOT_CONFIGURED or BUILDING_CAPACITY_EXCEEDED */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description PAYMENT_PROVIDER_ERROR: Stripe did not create the hold */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description CHARGER_UNAVAILABLE: the charger did not start; PAYMENTS_UNAVAILABLE: card payments are not configured (commercial points) */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getActiveSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActiveSessionResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getSession: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                sessionId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionDetailResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description SESSION_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    stopSession: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                sessionId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description SESSION_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description SESSION_ALREADY_ENDED */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    confirmSessionPayment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                sessionId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description SESSION_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description PAYMENT_NOT_REQUIRED: the session is not paid by card */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description PAYMENT_PROVIDER_ERROR: Stripe could not be reached */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    createSessionPaymentSheet: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                sessionId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentSheetDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description SESSION_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description PAYMENT_NOT_REQUIRED: the session is not paid by card; PAYMENT_NOT_PENDING: the hold is no longer awaiting confirmation */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description PAYMENT_PROVIDER_ERROR: Stripe could not be reached */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    handleStripeWebhook: {
        parameters: {
            query?: never;
            header: {
                "stripe-signature": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WebhookReceiptDto"];
                };
            };
            /** @description INVALID_WEBHOOK_SIGNATURE */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description PAYMENTS_UNAVAILABLE: the webhook secret is not configured */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    exportMonthlyStatementCsv: {
        parameters: {
            query?: {
                /** @description Calendar month in America/Sao_Paulo; defaults to the current month */
                month?: string;
            };
            header?: never;
            path: {
                organizationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/csv": string;
                };
            };
            /** @description Invalid month */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Organization not found or user is not a member */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getMonthlyStatement: {
        parameters: {
            query?: {
                /** @description Calendar month in America/Sao_Paulo; defaults to the current month */
                month?: string;
            };
            header?: never;
            path: {
                organizationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MonthlyStatementResponseDto"];
                };
            };
            /** @description Invalid month */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Organization not found or user is not a member */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listOrganizationSessions: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                month?: string;
                unit?: string;
                status?: components["schemas"]["ChargingSessionStatus"];
            };
            header?: never;
            path: {
                organizationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrganizationSessionPageDto"];
                };
            };
            /** @description Invalid filters */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Organization not found or user is not a member */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getOrganizationOverview: {
        parameters: {
            query?: {
                /** @description Calendar month in America/Sao_Paulo; defaults to the current month */
                month?: string;
            };
            header?: never;
            path: {
                organizationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrganizationOverviewResponseDto"];
                };
            };
            /** @description Invalid month */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Organization not found or user is not a member */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}
